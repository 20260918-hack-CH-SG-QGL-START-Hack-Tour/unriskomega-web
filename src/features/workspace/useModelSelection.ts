"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import {
  type ModelCatalogue,
  parseModelCatalogue,
} from "@/lib/models/aiModels";

export function useModelSelection() {
  const [catalogue, setCatalogue] = useState<ModelCatalogue | null>(null);
  const [model, setModel] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Revision explicitly retries the authenticated catalogue request.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    api("ai/models", {
      signal: AbortSignal.any([
        controller.signal,
        AbortSignal.timeout(clientConfig.requestTimeoutMs),
      ]),
    })
      .then((value) => {
        if (controller.signal.aborted) return;
        const next = parseModelCatalogue(value);
        setCatalogue(next);
        setModel((current) => current ?? next.defaultModel);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  return {
    models: catalogue?.models ?? [],
    model,
    loading,
    error,
    select(value: string) {
      if (catalogue?.models.some((model) => model.id === value))
        setModel(value);
    },
    reload() {
      setRevision((current) => current + 1);
    },
  };
}
export type ModelSelection = ReturnType<typeof useModelSelection>;
