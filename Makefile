all: up

build:
	docker compose -p transcendence build

up:
	docker compose -p transcendence up --build -d

down:
	docker compose -p transcendence down

re:
	docker compose -p transcendence down
	docker compose -p transcendence up --build -d

attach:
	docker compose up

prune:
	docker system prune --all --force --volumes

fclean: down prune

p:
	docker system prune -a
	docker builder prune

n:
	docker network prune