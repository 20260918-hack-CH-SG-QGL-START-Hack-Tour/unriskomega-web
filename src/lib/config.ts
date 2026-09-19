export { serverConfig } from "../../runtime-config.mjs";
export const clientConfig = {
  apiPrefix: "/api/v1",
  socketPath: "/api/v1/ws",
  requestTimeoutMs: 120000,
  maxMessageLength: 4000,
  maxImagePromptLength: 2000,
  maxVoiceDurationMs: 60000,
};
