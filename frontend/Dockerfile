# Stage 1: Build the React SPA with Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Cache node modules
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .

ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve production assets via Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
