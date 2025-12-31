FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# "start:dev" means "nest start --watch"
CMD ["npm", "run", "start:dev"]