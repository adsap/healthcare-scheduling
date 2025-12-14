FROM node:20-alpine3.17 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:20-alpine3.17 AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]