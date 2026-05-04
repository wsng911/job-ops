FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git python3 make g++ && \
    rm -rf /var/lib/apt/lists/* && \
    git config --global user.email "dev@example.com" && \
    git config --global user.name "dev"

COPY package*.json ./
COPY orchestrator/package.json ./orchestrator/
COPY shared/package.json ./shared/

RUN npm install

COPY . .

RUN git init && git add -A && git commit -m "init" || true

RUN npm run build --workspace=orchestrator 2>/dev/null || \
    cd orchestrator && npm run build 2>/dev/null || true

FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/* && \
    git config --global user.email "dev@example.com" && \
    git config --global user.name "dev"

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/orchestrator ./orchestrator
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/node_modules ./node_modules
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN mkdir -p /app/data && chmod +x docker-entrypoint.sh 2>/dev/null || true

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data

EXPOSE 3001

CMD ["node", "orchestrator/dist/server/index.js"]
