# Multi-stage build for CrazyTrainAI - Fixed for DigitalOcean

FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy all workspace folders
COPY shared/ ./shared/
COPY server/ ./server/
COPY client/ ./client/

# Install all dependencies (including workspaces)
RUN npm install --legacy-peer-deps

# Build shared package first
RUN npm run build --workspace=shared

# Build server
RUN npm run build --workspace=server

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Copy built artifacts
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/server/dist ./server/dist

# Install production dependencies
RUN npm install --legacy-peer-deps --production=false

# Set working directory to server
WORKDIR /app/server

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start server
CMD ["node", "dist/index.js"]