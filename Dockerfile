# Stage 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx
COPY --from=builder /app/dist ./dist
COPY api/ ./api/
EXPOSE 3001
CMD ["tsx", "api/server.ts"]
