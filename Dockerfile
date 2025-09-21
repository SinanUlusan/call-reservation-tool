# Multi-stage build for production
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application and copy data source
RUN npx nx build call-reservation-tool --prod
COPY apps/call-reservation-tool/src/data-source.ts apps/call-reservation-tool/src/data-source.ts

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nestjs:nodejs /app/package.json ./package.json

# Create data directory for SQLite and set proper permissions
RUN mkdir -p /app/data && chown -R nestjs:nodejs /app && chmod -R 755 /app

USER nestjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/reservations.db
ENV TYPEORM_SYNCHRONIZE=false

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Create startup script to run migrations and start app
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
npx typeorm migration:run -d /app/dist/apps/call-reservation-tool/data-source.js || echo "Migration failed, continuing..."\n\
echo "Starting application..."\n\
node dist/apps/call-reservation-tool/main.js' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]