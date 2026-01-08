# Build stage - Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Link image to GitHub repository
LABEL org.opencontainers.image.source=https://github.com/chachoCL/calendario-ac-cosmetic

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage - Node.js server
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code
COPY server ./server

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Create data directory for SQLite
RUN mkdir -p /data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/data/salon.db

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "server/index.js"]
