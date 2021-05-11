FROM node:12

WORKDIR /usr/app

COPY package*.json ./
RUN npm installs

COPY . .

EXPOSE 3001

CMD ["npm", "start"]