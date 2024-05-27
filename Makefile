build:
	docker compose -p transcendence build

up:
	docker compose -p transcendence up --build -d

down:
	docker compose -p transcendence down

re:
	docker compose -p transcendence down
	docker compose -p transcendence up --build -d
