FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run db:deploy && npm run db:seed && npm start"]
