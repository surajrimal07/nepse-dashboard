# Debian image
FROM node:slim AS base
# Install pnpm globally
RUN npm install -g pnpm@10.14.0

FROM base AS installer
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install Bun for building
RUN npm install -g bun

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/backend/package.json ./packages/backend/
COPY packages/emails/package.json ./packages/emails/
COPY packages/logger/package.json ./packages/logger/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/ui/package.json ./packages/ui/
COPY packages/zod/package.json ./packages/zod/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the server
RUN pnpm turbo run build --filter=@nepse-dashboard/backend

# Create a minimal Bun-based runtime image
FROM oven/bun:debian AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built output and runtime dependencies
COPY --from=installer /app/apps/server/dist ./dist
COPY --from=installer /app/apps/server/package.json ./package.json

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=10 \
    CMD ["bun", "--eval", "try { await fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)) } catch { process.exit(1) }"]

# Expose port
EXPOSE 3000

# Run your server
CMD ["dist/index.js"]