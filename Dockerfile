FROM oven/bun:1.4.2 AS dependencies
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
FROM dependencies AS builder
COPY . .
RUN bun audit && bun test && bun run build
FROM oven/bun:1.4.2 AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/server.mjs /app/runtime-config.mjs ./
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD bun -e 'fetch(`http://127.0.0.1:${process.env.PORT}/api/health`).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))'
CMD ["bun", "server.mjs"]
