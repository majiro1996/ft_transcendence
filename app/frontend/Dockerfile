FROM nginx:alpine

# Copy the frontend code into the container
#COPY frontend /usr/share/nginx/html

COPY /js  /usr/share/nginx/html/js
COPY index.html /usr/share/nginx/html/index.html
COPY /html /usr/share/nginx/html/html
COPY /bootstrap /usr/share/nginx/html/bootstrap
COPY /css /usr/share/nginx/html/css
COPY media /usr/share/nginx/html/media

COPY conf/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]