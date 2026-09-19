import { readBoundedBody } from "@/lib/api/readBoundedBody";
export async function POST(request: Request) {
  try {
    const body = JSON.parse(await readBoundedBody(request, 8192));
    const directive = body?.["csp-report"]?.["effective-directive"];
    if (typeof directive === "string" && /^[a-z-]{1,50}$/.test(directive))
      console.warn("Content Security Policy violation:", directive);
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
