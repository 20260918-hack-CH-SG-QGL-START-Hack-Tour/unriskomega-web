export function GET() {
  return Response.json(
    { status: "ok", service: "unriskomega-web" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
