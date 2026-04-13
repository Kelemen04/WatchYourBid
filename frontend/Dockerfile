FROM node:22-alpine

WORKDIR /watchyourbid

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]