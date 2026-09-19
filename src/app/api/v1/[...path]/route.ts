import type { NextRequest } from "next/server";
import { readBoundedBody } from "@/lib/api/readBoundedBody";
import { serverConfig } from "@/lib/config";

const allowed =
  /^(auth\/(login|logout|me|demo)|admin\/(catalog|runtime|outcomes)|clients|market-context|documents(?:\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(?:\/(content|import))?)?|portfolios(?:\/[a-zA-Z0-9_-]+)?|briefings|chat|images|voice\/session|drafts)$/;
async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path.join("/");
  const maximum = path === "documents" ? 6_000_000 : 2_000_000;
  if (!allowed.test(path))
    return Response.json({ error: "Not found" }, { status: 404 });
  if (request.method !== "GET" && request.method !== "HEAD") {
    const origin = request.headers.get("origin");
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (origin && new URL(origin).host !== host)
      return Response.json({ error: "Origin denied" }, { status: 403 });
    if (Number(request.headers.get("content-length") ?? 0) > maximum)
      return Response.json({ error: "Request too large" }, { status: 413 });
  }
  const headers = new Headers();
  for (const key of ["content-type", "cookie", "origin", "idempotency-key"]) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  try {
    const target = new URL(`/api/v1/${path}`, serverConfig().backend);
    target.search = request.nextUrl.search;
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await readBoundedBody(request, maximum);
    if (body && body.length > maximum)
      return Response.json({ error: "Request too large" }, { status: 413 });
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(120000),
    });
    const responseHeaders = new Headers({
      "Cache-Control": "no-store",
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    });
    for (const cookie of upstream.headers.getSetCookie())
      responseHeaders.append("Set-Cookie", cookie);
    for (const name of [
      "content-disposition",
      "content-security-policy",
      "x-content-type-options",
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof RangeError)
      return Response.json({ error: "Request too large" }, { status: 413 });
    return Response.json(
      { error: "Service unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PATCH };
