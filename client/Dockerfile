# Use an official Node.js runtime base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package management files to install dependencies first
COPY package*.json ./
RUN npm install

# Copy the rest of your React app workspace files
COPY . .

# Expose the port your frontend dev server uses (typically 3000)
EXPOSE 3000

# Boot up the frontend application development server
CMD ["npm", "start"]