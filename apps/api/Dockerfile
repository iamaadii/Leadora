# Production Dockerfile for Leadora API
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=5000

# Copy package manifests
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY src ./src

# Create non-root user permissions
RUN chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
