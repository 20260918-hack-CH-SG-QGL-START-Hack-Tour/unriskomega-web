import http from "node:http";
import https from "node:https";
import next from "next";
import { serverConfig } from "./runtime-config.mjs";

const config = serverConfig();
// Next registers an upgrade listener on its supplied HTTP server. Keep that
// listener separate so it cannot close the authenticated application socket.
const frameworkUpgrades = http.createServer();
const app = next({
  dev: false,
  hostname: config.hostname,
  port: config.port,
  httpServer: frameworkUpgrades,
});
await app.prepare();
const server = http.createServer(app.getRequestHandler());
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, config.backend);
  if (url.pathname !== "/api/v1/ws") {
    frameworkUpgrades.emit("upgrade", request, socket, head);
    return;
  }
  const host = request.headers["x-forwarded-host"] ?? request.headers.host;
  try {
    if (
      !request.headers.origin ||
      new URL(request.headers.origin).host !== host
    ) {
      socket.destroy();
      return;
    }
  } catch {
    socket.destroy();
    return;
  }
  const target = new URL(config.backend);
  const transport = target.protocol === "https:" ? https : http;
  const headers = {
    host: target.host,
    connection: "Upgrade",
    upgrade: "websocket",
  };
  for (const name of [
    "cookie",
    "origin",
    "sec-websocket-key",
    "sec-websocket-version",
    "sec-websocket-protocol",
  ])
    if (request.headers[name]) headers[name] = request.headers[name];
  const upstream = transport.request({
    hostname: target.hostname,
    port: target.port || undefined,
    path: url.pathname + url.search,
    headers,
    method: "GET",
  });
  upstream.on("upgrade", (response, remote, remoteHead) => {
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " +
        response.headers["sec-websocket-accept"] +
        "\r\n\r\n",
    );
    if (head.length) remote.write(head);
    if (remoteHead.length) socket.write(remoteHead);
    remote.pipe(socket);
    socket.pipe(remote);
    remote.on("error", () => socket.destroy());
    socket.on("error", () => remote.destroy());
    socket.on("close", () => remote.destroy());
  });
  upstream.on("response", () => socket.destroy());
  upstream.on("error", () => socket.destroy());
  upstream.setTimeout(10000, () => upstream.destroy());
  upstream.end();
});
server.listen(config.port, config.hostname);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
