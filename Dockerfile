FROM node:14

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

CMD ["node", "dist/index.js"]
EXPOSE 3000
