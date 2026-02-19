# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────
FROM nginx:alpine AS final

# Copy Vite build output
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config: proxy /api to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
