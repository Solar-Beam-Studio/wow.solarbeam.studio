FROM oven/bun:1.3-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
COPY packages/database/package.json ./packages/database/
COPY apps/worker/package.json ./apps/worker/
RUN bun install

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY . .

# Generate Prisma client
RUN cd packages/database && bunx prisma generate

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 worker && \
    adduser --system --uid 1001 worker

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/worker ./apps/worker
COPY --from=builder /app/package.json ./

USER worker

CMD ["bun", "apps/worker/src/index.ts"]
