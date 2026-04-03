# Patient Frontend Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./

COPY frontend-patient/package.json ./frontend-patient/
COPY frontend-patient/tsconfig.json ./frontend-patient/
COPY frontend-patient/vite.config.ts ./frontend-patient/
COPY frontend-patient/tailwind.config.ts ./frontend-patient/
COPY frontend-patient/postcss.config.cjs ./frontend-patient/
COPY frontend-patient/index.html ./frontend-patient/

RUN npm install

COPY frontend-patient/src ./frontend-patient/src

WORKDIR /app/frontend-patient

# Use Docker network URL for API
ARG VITE_API_URL=http://telemed-api:8080
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend-patient/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]