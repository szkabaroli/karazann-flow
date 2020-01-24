# Build stage
FROM node:12 AS build
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

RUN npm install
ENV NODE_ENV=production
RUN npm run build

# Runtime stage (production part)
FROM node:12 AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist/ dist/
COPY --from=build /app/src/config dist/config

CMD [ "node", "./dist/index.js" ]