FROM node:current-alpine

WORKDIR /servidor

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]