FROM node:10-alpine as build-step

RUN mkdir /app
WORKDIR /app
COPY package.json /app
RUN yarn install
COPY . /app

RUN yarn build

RUN yarn global add serve
EXPOSE 3000
CMD ["serve", "-s", "build"]