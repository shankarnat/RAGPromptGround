.PHONY: help
help:
	@echo "RAG Playground Docker Commands"
	@echo "=============================="
	@echo "make dev        - Start development environment"
	@echo "make prod       - Start production environment"
	@echo "make stop       - Stop all containers"
	@echo "make clean      - Stop containers and remove volumes"
	@echo "make logs       - View application logs"
	@echo "make db-logs    - View database logs"
	@echo "make shell      - Open shell in app container"
	@echo "make db-shell   - Open psql shell"
	@echo "make migrate    - Run database migrations"
	@echo "make build      - Build all containers"
	@echo "make rebuild    - Rebuild containers (no cache)"

.PHONY: dev
dev:
	docker-compose -f docker-compose.dev.yml up

.PHONY: prod
prod:
	docker-compose up -d

.PHONY: stop
stop:
	docker-compose down

.PHONY: clean
clean:
	docker-compose down -v

.PHONY: logs
logs:
	docker-compose logs -f app

.PHONY: db-logs
db-logs:
	docker-compose logs -f db

.PHONY: shell
shell:
	docker-compose exec app sh

.PHONY: db-shell
db-shell:
	docker-compose exec db psql -U postgres ragplayground

.PHONY: migrate
migrate:
	docker-compose exec app npm run db:push

.PHONY: build
build:
	docker-compose build

.PHONY: rebuild
rebuild:
	docker-compose build --no-cache