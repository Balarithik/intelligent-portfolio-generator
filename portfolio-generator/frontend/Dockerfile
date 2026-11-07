# Multi-stage Dockerfile for React Frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Serve static production assets via Nginx
FROM nginx:alpine AS runner

ENV API_UPSTREAM=https://intelligent-portfolio-generator.onrender.com/api/ \
    NGINX_ENVSUBST_FILTER=^API_UPSTREAM$

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
