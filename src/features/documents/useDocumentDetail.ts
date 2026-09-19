"use client";
import { useEffect, useState } from "react";
import { requestDocumentDetail } from "./detail";
import type { CompleteDocument } from "./model";

type DetailState = {
  key: string;
  document: CompleteDocument | null;
  error: boolean;
};

export function useDocumentDetail(id: string, clientId: string) {
  const [state, setState] = useState<DetailState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${clientId}/${id}/${attempt}`;
  useEffect(() => {
    const requestKey = `${clientId}/${id}/${attempt}`;
    setState(null);
    if (!id) return;
    let active = true;
    const request = requestDocumentDetail(id, clientId);
    request.result.then(
      (document) => {
        if (active) setState({ key: requestKey, document, error: false });
      },
      () => {
        if (active) setState({ key: requestKey, document: null, error: true });
      },
    );
    return () => {
      active = false;
      request.cancel();
    };
  }, [id, clientId, attempt]);
  // Guard the render before effect cleanup when a new selection arrives.
  const current = state?.key === key ? state : null;
  return {
    document: current?.document ?? null,
    loading: !!id && !current,
    error: current?.error ?? false,
    retry: () => setAttempt((value) => value + 1),
  };
}
