# Multi-stage build - keeps final image small (~25MB instead of ~500MB)
# Stage 1: Build the React app with Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first - Docker caches this layer so npm install only runs when deps change
COPY package*.json ./

# Clean install - faster and more reliable than npm install
RUN npm ci

# Now copy everything else
COPY . .

# Accept API URL as build argument (for CI/CD)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app - creates /app/dist with all the static files
RUN npm run build

# Stage 2: Production - only what we need to serve the app
FROM nginx:alpine AS production

# Use our custom nginx config instead of default
COPY nginx.conf /etc/nginx/nginx.conf

# Grab the built files from stage 1 - this is all we need!
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check for Kubernetes - checks /health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

# Metadata - useful for identifying images
LABEL maintainer="Drone Surveillance Team"
LABEL version="1.0.0"
LABEL description="Drone Surveillance Control Panel Frontend"

# Run nginx in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]

