# Use official Node.js Alpine base image
FROM node:20-alpine AS base

# Install openssl for Prisma engine support on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema and configuration files
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

# Copy source code
COPY src ./src/

# Run prisma generate and build TypeScript project
RUN npx prisma generate
RUN npm run build

# Expose backend API and Socket.IO port
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8000

# Command to start backend server
CMD ["npm", "start"]
