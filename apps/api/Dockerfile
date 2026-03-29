# Use node base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install

# Copy all files including Prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Start command is set in docker-compose.yml (migrations + start)
CMD ["npm", "start", "--workspace=apps/api"]
