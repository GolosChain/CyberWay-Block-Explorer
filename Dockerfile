FROM node:10 as builder
#frontend dependencies
WORKDIR /usr/src/app
COPY ./package.json ./yarn.lock .npmrc ./
RUN yarn install

#backend dependencies
WORKDIR /usr/src/app/server
COPY ./server/package.json ./server/yarn.lock ./
RUN yarn install

#build
WORKDIR /usr/src/app
COPY ./public ./public/
COPY ./src ./src/
RUN npm run build

FROM node:10
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules/ ./node_modules/
COPY --from=builder /usr/src/app/build/ ./build/
COPY --from=builder /usr/src/app/server/ ./server/
COPY ./server/src/ ./server/src/
WORKDIR /usr/src/app/server
CMD ["node", "src/index.js"]
