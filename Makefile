all: init up

build:
	docker compose -p transcendence build

up:
	docker compose -p transcendence up --build -d

down:
	docker compose -p transcendence down

re: down init up

attach:
	docker compose up

prune:
	docker system prune --all --force --volumes

fclean: down prune dbclean
	rm app/.env
	rm -rf app/frontend/js/frontenv.js

init:
	cp .env app/.env
	./scripts/frontenv.sh

dbclean:
	./scripts/dbclean.sh
