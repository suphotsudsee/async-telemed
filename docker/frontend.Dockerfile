FROM node:22-alpine AS build

ARG APP_NAME
ARG VITE_API_URL=http://localhost:8080

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json tsconfig.base.json
COPY ${APP_NAME}/package.json ${APP_NAME}/package.json
COPY ${APP_NAME}/tsconfig.json ${APP_NAME}/tsconfig.json
COPY ${APP_NAME}/vite.config.ts ${APP_NAME}/vite.config.ts
COPY ${APP_NAME}/tailwind.config.ts ${APP_NAME}/tailwind.config.ts
COPY ${APP_NAME}/postcss.config.cjs ${APP_NAME}/postcss.config.cjs
COPY ${APP_NAME}/index.html ${APP_NAME}/index.html

RUN npm install

COPY ${APP_NAME}/src ${APP_NAME}/src

WORKDIR /app/${APP_NAME}
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/${APP_NAME}/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

