# Admin Frontend Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./

COPY frontend-admin/package.json ./frontend-admin/
COPY frontend-admin/tsconfig.json ./frontend-admin/
COPY frontend-admin/vite.config.ts ./frontend-admin/
COPY frontend-admin/tailwind.config.ts ./frontend-admin/
COPY frontend-admin/postcss.config.cjs ./frontend-admin/
COPY frontend-admin/index.html ./frontend-admin/

RUN npm install

COPY frontend-admin/src ./frontend-admin/src

WORKDIR /app/frontend-admin

ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend-admin/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]