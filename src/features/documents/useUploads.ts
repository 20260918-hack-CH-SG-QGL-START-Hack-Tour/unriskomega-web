"use client";
import { useEffect, useRef, useState } from "react";
import { api, record } from "@/lib/api/client";
import { publishDataChange } from "@/lib/api/dataChanges";
import type { Locale } from "@/lib/i18n";
import { filePayload } from "./model";
import {
  parseUploadResult,
  runUploadBatch,
  type UploadItem,
  type UploadResult,
} from "./uploadBatch";

export function useUploads(
  context: {
    clientId: string;
    portfolioId: string;
    chatSessionId: string;
    scope: string;
    kind: string;
    locale: Locale;
  },
  onSaved: (results: UploadResult[]) => Promise<void>,
) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  const contextKey = `${context.clientId}:${context.portfolioId}:${context.chatSessionId}`;
  const previousContext = useRef(contextKey);
  useEffect(() => {
    if (previousContext.current !== contextKey) {
      previousContext.current = contextKey;
      setItems([]);
      setBusy(false);
    }
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [contextKey]);
  async function upload(files: File[], retryId?: string) {
    if (request.current || !files.length) return;
    const controller = new AbortController();
    request.current = controller;
    const batch = files.map((file, index) => ({
      id: index === 0 && retryId ? retryId : crypto.randomUUID(),
      file,
      state: "queued" as const,
    }));
    setItems((current) =>
      retryId
        ? current.map((item) => (item.id === retryId ? batch[0] : item))
        : batch,
    );
    setBusy(true);
    const results: UploadResult[] = [];
    function update(id: string, change: Partial<UploadItem>) {
      if (request.current !== controller) return;
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...change } : item)),
      );
    }
    try {
      await runUploadBatch(
        batch,
        async (item) => {
          try {
            update(item.id, { state: "reading" });
            const payload = await filePayload(item.file);
            controller.signal.throwIfAborted();
            update(item.id, { state: "uploading" });
            const response = record(
              await api("documents", {
                method: "POST",
                signal: controller.signal,
                body: JSON.stringify({
                  ...payload,
                  ...context,
                  kind:
                    context.kind === "custody" &&
                    payload.mimeType !== "application/pdf"
                      ? "document"
                      : context.kind,
                }),
              }),
            );
            const result = parseUploadResult(response, {
              clientId: context.clientId,
              portfolioId: context.portfolioId,
              review:
                context.kind === "custody" &&
                payload.mimeType === "application/pdf",
            });
            results.push(result);
            update(item.id, {
              result,
              state: result.imported
                ? "imported"
                : result.review
                  ? "review"
                  : "saved",
            });
          } catch (error) {
            if (!controller.signal.aborted)
              update(item.id, {
                state: "failed",
                error: error instanceof Error ? error.message : "Upload failed",
              });
          }
        },
        controller.signal,
      );
      if (results.length && request.current === controller) {
        publishDataChange();
        await onSaved(results);
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  return { items, busy, upload };
}
