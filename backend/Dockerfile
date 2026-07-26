# syntax=docker/dockerfile:1

# --- deps: install production dependencies only ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- runtime: slim image with just node_modules + source ---
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
# dumb-init gives us proper PID 1 signal handling (SIGTERM/SIGINT forwarded to node).
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY server.js ./
COPY seed.js ./
COPY src ./src
# Run as the built-in non-root `node` user.
USER node
EXPOSE 3000
# Liveness: the process answers /api/health (no DB dependency).
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
