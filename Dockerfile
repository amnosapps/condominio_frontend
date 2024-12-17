# Use Node.js image
FROM node:18.17.0

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Run React app in development mode
CMD ["npm", "start"]
