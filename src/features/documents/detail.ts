import { api } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import { parseDocumentDetail } from "./model";

export function requestDocumentDetail(id: string, clientId: string) {
  const controller = new AbortController();
  const signal = AbortSignal.any([
    controller.signal,
    AbortSignal.timeout(clientConfig.requestTimeoutMs),
  ]);
  const result = api(`documents/${encodeURIComponent(id)}`, { signal }).then(
    (value) => {
      // A cancelled fetch may already have delivered its response body.
      signal.throwIfAborted();
      return parseDocumentDetail(value, id, clientId);
    },
  );
  return { result, cancel: () => controller.abort() };
}
