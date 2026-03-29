FROM node:20-alpine as builder

WORKDIR /app
# Copy root package.json for workspaces
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm install

# Copy source
COPY apps/web ./apps/web

# Build the web app
RUN npm run build --workspace=apps/web

# Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
