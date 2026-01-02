FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# "start:dev:docker": check in package.json
CMD ["npm", "run", "start:dev:docker"]