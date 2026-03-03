FROM node:22-alpine

WORKDIR /watchyourbid

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

EXPOSE 8000

CMD ["npm","run","start"]