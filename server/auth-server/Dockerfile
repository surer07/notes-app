FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose your authentication service port
EXPOSE 4000

CMD ["npm", "start"]