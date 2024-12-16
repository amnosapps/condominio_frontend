# Use the official Node.js image as the base for building the app
FROM node:18.17.0 AS build

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the React app for production
RUN npm run build

# Use the official Nginx image as the base for serving the app
FROM nginx:alpine

# Copy the built files from the previous stage to Nginx's default HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
