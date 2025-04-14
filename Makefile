include .env

.PHONY: start stop clean

start:
	docker compose --env-file .env up 

build:
	docker compose --env-file .env build

stop:
	docker compose --env-file .env down

clean:
	docker compose --env-file .env down \
		--rmi all \
		--remove-orphans
