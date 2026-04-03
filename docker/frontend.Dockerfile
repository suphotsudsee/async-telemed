# Frontend Dockerfile - builds specific app based on APP_NAME arg

FROM node:22-alpine AS build

ARG APP_NAME=frontend-patient
ARG VITE_API_URL=http://localhost:8080

WORKDIR /app

# Copy root files
COPY package.json ./
COPY tsconfig.base.json ./

# Copy app specific files
COPY ${APP_NAME}/package.json ./${APP_NAME}/package.json
COPY ${APP_NAME}/tsconfig.json ./${APP_NAME}/tsconfig.json
COPY ${APP_NAME}/vite.config.ts ./${APP_NAME}/vite.config.ts
COPY ${APP_NAME}/tailwind.config.ts ./${APP_NAME}/tailwind.config.ts
COPY ${APP_NAME}/postcss.config.cjs ./${APP_NAME}/postcss.config.cjs
COPY ${APP_NAME}/index.html ./${APP_NAME}/index.html

RUN npm install

COPY ${APP_NAME}/src ./${APP_NAME}/src

WORKDIR /app/${APP_NAME}
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Production stage
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy based on which app was built
RUN case "${APP_NAME}" in \
    frontend-patient)  mkdir -p /usr/share/nginx/html && cp -r /app/frontend-patient/dist/* /usr/share/nginx/html/ ;; \
    frontend-doctor)  mkdir -p /usr/share/nginx/html && cp -r /app/frontend-doctor/dist/* /usr/share/nginx/html/ ;; \
    frontend-admin)   mkdir -p /usr/share/nginx/html && cp -r /app/frontend-admin/dist/* /usr/share/nginx/html/ ;; \
    esac

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]