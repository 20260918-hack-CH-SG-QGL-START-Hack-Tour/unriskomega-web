import { clientConfig } from "@/lib/config";
export class ApiError extends Error {
  constructor(
    public status: number,
    detail?: string,
  ) {
    super(detail ?? `Request failed (${status})`);
  }
}
export async function api(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const response = await fetch(`${clientConfig.apiPrefix}/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "same-origin",
    cache: "no-store",
    signal:
      options.signal ?? AbortSignal.timeout(clientConfig.requestTimeoutMs),
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined")
      window.dispatchEvent(new Event("uro-session-expired"));
    let detail: string | undefined;
    try {
      const problem = await response.json();
      if (typeof problem.detail === "string") detail = problem.detail;
    } catch {
      /* Non-JSON errors keep the HTTP status. */
    }
    throw new ApiError(response.status, detail);
  }
  if (response.status === 204) return null;
  return response.json();
}
export function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error("Invalid response object");
  return value as Record<string, unknown>;
}
export function string(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid response string");
  return value;
}
export function number(value: unknown): number {
  const result =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;
  if (!Number.isFinite(result)) throw new Error("Invalid response number");
  return result;
}
export function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Invalid response list");
  return value;
}
