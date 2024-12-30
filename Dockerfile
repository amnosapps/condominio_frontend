# Use Nginx to serve the pre-built app
FROM nginx:alpine

# Copy the Nginx configuration if you have a custom one (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
