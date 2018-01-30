FROM node:latest
#ADD sources.list /etc/apt/sources.list
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev
RUN mkdir /image-server
WORKDIR /image-server
ADD package.json /image-server/package.json
ADD . /image-server
RUN npm install
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone