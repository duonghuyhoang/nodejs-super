FROM node:18-alpine

WORKDIR /app

EXPOSE 3000
ENV NODE_ENV=production

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY ecosystem.config.js .
COPY .env.production .
COPY ./src ./src

RUN npm install pm2 -g
RUN npm install
RUN npm install -g rimraf typescript ts-node tsc-alias 
RUN npm run build

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
