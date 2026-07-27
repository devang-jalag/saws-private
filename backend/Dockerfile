# Stage 1: install production dependencies only
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: runtime image
FROM node:20-alpine

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Cloud Run injects PORT and expects the container to listen on it.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
