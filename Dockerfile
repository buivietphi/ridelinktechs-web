FROM node:22-alpine AS deps
WORKDIR /app
# The repo installs with pnpm (pnpm-lock.yaml is the current lockfile; the
# package-lock.json that used to be here was a month stale and `npm ci` refuses
# to run against it). Pin pnpm to the version that wrote the lockfile so the
# image resolves the same graph every build, and use --frozen-lockfile so a
# package.json/lock drift fails the build instead of silently resolving fresh.
RUN npm install -g pnpm@11.20.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# .next/standalone only traces files the server imports at runtime, so the env
# file is not inside it. The standalone server loads .env.production from its
# own directory on startup (verified: with nothing exported, the prod Turnstile
# sitekey reaches the rendered HTML), so it has to sit next to server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./.env.production

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
