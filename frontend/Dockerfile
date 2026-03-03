FROM node:22-alpine

WORKDIR /watchyourbid

COPY package*.json ./
COPY . .

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]