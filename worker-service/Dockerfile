FROM node:16
ENV PLATFORM="docker"
#ENV NODE_ENV="production"

WORKDIR /usr/interfaces
COPY ./interfaces/package*.json ./
COPY ./interfaces/tsconfig.json ./
ADD ./interfaces/src ./src/.
RUN npm install
RUN npm pack

WORKDIR /usr/common
COPY ./common/package*.json ./
COPY ./common/tsconfig.json ./
ADD ./common/src ./src/.
RUN npm install /usr/interfaces/guardian-interfaces-*.tgz
RUN npm install
RUN npm pack

WORKDIR /usr/worker-service
COPY ./worker-service/package*.json ./
COPY ./worker-service/tsconfig.json ./
COPY ./worker-service/.env.docker ./.env
RUN npm install --force /usr/interfaces/guardian-interfaces-*.tgz /usr/common/guardian-common-*.tgz
RUN npm install --force
ADD ./worker-service/src ./src/.
RUN npm run build

CMD npm start
