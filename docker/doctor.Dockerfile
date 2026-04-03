# Doctor Frontend Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./

COPY frontend-doctor/package.json ./frontend-doctor/
COPY frontend-doctor/tsconfig.json ./frontend-doctor/
COPY frontend-doctor/vite.config.ts ./frontend-doctor/
COPY frontend-doctor/tailwind.config.ts ./frontend-doctor/
COPY frontend-doctor/postcss.config.cjs ./frontend-doctor/
COPY frontend-doctor/index.html ./frontend-doctor/

RUN npm install

COPY frontend-doctor/src ./frontend-doctor/src

WORKDIR /app/frontend-doctor

ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend-doctor/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]