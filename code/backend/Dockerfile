# ── Stage 1: dependencies + build ────────────────────────────────────────────
FROM node:20-alpine AS builder

# Prisma needs openssl; tsx/esbuild need python3+make on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# 1. Install dependencies
COPY package*.json ./
RUN npm ci

# 2. Copy everything needed to compile
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src/

# 3. Generate Prisma client (uses schema only, no DB connection needed)
RUN npx prisma generate

# 4. Compile TypeScript → dist/
RUN npm run build

# ── Stage 2: lean production image ───────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Copy only what's needed to run
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Entrypoint: run migrations then start the server
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 8000

CMD ["./docker-entrypoint.sh"]
