FROM nginx:alpine

# Copy the frontend code into the container
COPY frontend /usr/share/nginx/html

COPY conf/nginx.conf /etc/nginx/nginx.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]