FROM node:16 as frontendBuilder
WORKDIR /usr/interfaces
COPY ./interfaces/package*.json ./
COPY ./interfaces/tsconfig.json ./
ADD ./interfaces/src ./src/.
RUN npm install
RUN npm pack
WORKDIR /usr/local/frontend
COPY ./frontend/. /usr/local/frontend
RUN npm install /usr/interfaces/guardian-interfaces-*.tgz
RUN npm install
RUN npm run build

FROM nginx:latest
ENV PLATFORM="docker"
COPY ./web-proxy/configs/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontendBuilder /usr/local/frontend/dist/serapis-frontend /usr/share/nginx/html

EXPOSE 80
