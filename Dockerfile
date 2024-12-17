# Use the official Node.js image to build the React app
FROM node:18.17.0 AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source and build the React app
COPY . .
RUN npm run build

# Use the Nginx image to serve the built static files
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for serving the app
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
