# Build stage (React build)
FROM node:alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage (Nginx)
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# COPY YOUR CUSTOM CONFIG HERE:
COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]