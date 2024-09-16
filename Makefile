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
	docker network prune
	docker rm -v -f $(docker ps -a -q)

logs:
	docker compose -p transcendence logs -f
