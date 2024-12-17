# Use the official Node.js image as the base
FROM node:18.17.0

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose port 3000 (default for React apps)
EXPOSE 3000

# Run the React app
CMD ["npm", "start"]