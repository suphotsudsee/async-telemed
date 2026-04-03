# Node API Development Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
COPY backend/node-api/package.json ./backend/node-api/
COPY tsconfig.base.json ./

RUN npm install

# Copy source code
COPY backend/node-api ./backend/node-api

WORKDIR /app/backend/node-api

# Expose port
EXPOSE 8080

# Run in development mode with tsx
CMD ["npm", "run", "dev"]