# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Vite application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 or Cloud Run default 8080
# Cloud Run expects the container to listen on the port defined by the PORT environment variable.
# We will set nginx to listen on 80 and map 8080 to 80 in Cloud Run, or adjust nginx.conf to use PORT
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
