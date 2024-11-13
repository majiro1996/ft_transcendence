FROM nginx:alpine

# Install necessary packages
RUN apk add --no-cache gettext openssl

# Copy static files
COPY /js /usr/share/nginx/html/js
COPY /html /usr/share/nginx/html/html
COPY /bootstrap /usr/share/nginx/html/bootstrap
COPY /css /usr/share/nginx/html/css
COPY /media /usr/share/nginx/html/media
COPY /TicTacToe /usr/share/nginx/html/TicTacToe
COPY /pong /usr/share/nginx/html/pong
COPY index.html /usr/share/nginx/html/index.html

# Copy configuration files
COPY conf/nginx.conf /etc/nginx/nginx.conf.template
COPY conf/init.sh /usr/share/nginx/html/scripts/init.sh

# Make the init script executable
RUN chmod +x /usr/share/nginx/html/scripts/init.sh

# Create SSL directory and generate SSL certificate
RUN mkdir /etc/nginx/ssl && \
    openssl req -newkey rsa:4096 -days 42 -nodes -x509 \
    -subj "/C=ES/ST=AN/L=Malaga/O=42/OU=42/CN=transcendence/UID=EFDLC" \
    -out /etc/nginx/ssl/transcendence.crt \
    -keyout /etc/nginx/ssl/transcendence.key

# Expose port
EXPOSE 8001

# Start nginx with the init script
CMD ["/usr/share/nginx/html/scripts/init.sh"]