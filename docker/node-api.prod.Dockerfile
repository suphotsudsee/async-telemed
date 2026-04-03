# Node API Production Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
COPY backend/node-api/package.json ./backend/node-api/
COPY tsconfig.base.json ./

RUN npm install

COPY backend/node-api ./backend/node-api

WORKDIR /app/backend/node-api
RUN npm run build

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY backend/node-api/package.json ./backend/node-api/
COPY tsconfig.base.json ./
RUN npm install --omit=dev

COPY --from=build /app/backend/node-api/dist ./backend/node-api/dist
COPY --from=build /app/backend/node-api/package.json ./backend/node-api/package.json

WORKDIR /app/backend/node-api
EXPOSE 8080
CMD ["npm", "run", "start"]
