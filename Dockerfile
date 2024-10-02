FROM node:22-alpine

WORKDIR /api

COPY . .

RUN npm install

CMD npm start
