FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./

RUN rm -rf node_modules && \
    npm install --platform=linux --arch=x64 && \
    npm cache clean --force

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]