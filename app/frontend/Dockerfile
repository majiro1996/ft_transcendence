FROM nginx:alpine

RUN apk add --no-cache gettext
RUN apk add --no-cache openssl

COPY /js  /usr/share/nginx/html/js
COPY index.html /usr/share/nginx/html/index.html
COPY /html /usr/share/nginx/html/html
COPY /bootstrap /usr/share/nginx/html/bootstrap
COPY /css /usr/share/nginx/html/css
COPY media /usr/share/nginx/html/media

COPY conf/nginx.conf /etc/nginx/nginx.conf.template

COPY /TicTacToe /usr/share/nginx/html/TicTacToe
COPY /pong /usr/share/nginx/html/pong

COPY conf/init.sh /usr/share/nginx/html/scripts/init.sh
RUN chmod +x /usr/share/nginx/html/scripts/init.sh

RUN mkdir /etc/nginx/ssl
RUN	openssl req -newkey rsa:4096 -days 42 -nodes -x509  \
	 -subj "/C=ES/ST=AN/L=Malaga/O=42/OU=42/CN=transcendence/UID=EFDLC" \
	 -out /etc/nginx/ssl/transcendence.crt \
	 -keyout /etc/nginx/ssl/transcendence.key

EXPOSE 8001

# Start nginx
#CMD ["nginx", "-g", "daemon off;"]

CMD ["/usr/share/nginx/html/scripts/init.sh"]