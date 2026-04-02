FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY backend/node-api/package.json backend/node-api/package.json
COPY tsconfig.base.json tsconfig.base.json
COPY backend/node-api/tsconfig.json backend/node-api/tsconfig.json

RUN npm install

COPY backend/node-api backend/node-api

WORKDIR /app/backend/node-api

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]

