export function serverConfig() {
  const backend = process.env.BACKEND_URL;
  if (!backend) throw new Error("BACKEND_URL is required");
  const url = new URL(backend);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("BACKEND_URL must be an HTTP origin without credentials");
  return {
    backend: url.origin,
    port: Number(process.env.PORT ?? 3000),
    hostname: process.env.HOSTNAME ?? "0.0.0.0",
    production: process.env.NODE_ENV === "production",
  };
}
