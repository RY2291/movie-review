# Next.js (React) frontend - development focused
FROM node:22-alpine AS dev

WORKDIR /app

# Install OS deps if needed (git/openssl). Keep minimal for faster builds.
RUN apk add --no-cache libc6-compat

# Enable corepack in case you prefer yarn/pnpm later
RUN corepack enable

# Copy only package manifests first for better layer caching
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies (prefer npm ci if lockfile exists)
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then corepack yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack pnpm install --frozen-lockfile; \
    else npm install; fi

# Copy the rest of the app
COPY . .

# Expose Next.js dev server
EXPOSE 3000

# Default command: development server with polling for Docker environments
ENV WATCHPACK_POLLING=true
CMD ["npm", "run", "dev"]

# --- Optional production build stages below ---
FROM dev AS builder
ENV NODE_ENV=production
RUN npm run build || (if [ -f yarn.lock ]; then corepack yarn build; elif [ -f pnpm-lock.yaml ]; then corepack pnpm build; else exit 1; fi)

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; \
    elif [ -f yarn.lock ]; then corepack yarn install --frozen-lockfile --production; \
    elif [ -f pnpm-lock.yaml ]; then corepack pnpm install --frozen-lockfile --prod; \
    else npm install --omit=dev; fi

# Copy built assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "run", "start"] 