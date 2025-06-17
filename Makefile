# GitBook Manual Site - Docker Commands

.PHONY: help
help:
	@echo "GitBook Manual Site - Docker Commands"
	@echo "====================================="
	@echo "make build          - Build production Docker image"
	@echo "make build-dev      - Build development Docker image"
	@echo "make run            - Run production container"
	@echo "make run-dev        - Run development container with hot reload"
	@echo "make up             - Start services with docker-compose"
	@echo "make up-dev         - Start development services"
	@echo "make down           - Stop all services"
	@echo "make logs           - Show container logs"
	@echo "make shell          - Enter container shell"
	@echo "make clean          - Remove containers and images"

# Build production image
.PHONY: build
build:
	docker build -t gitbook-manual:latest -f Dockerfile .

# Build development image
.PHONY: build-dev
build-dev:
	docker build -t gitbook-manual:dev -f Dockerfile.dev .

# Run production container
.PHONY: run
run:
	docker run -d --name gitbook-manual -p 8080:8080 gitbook-manual:latest

# Run development container with volume mount
.PHONY: run-dev
run-dev:
	docker run -d --name gitbook-manual-dev \
		-p 8080:8080 \
		-v $(PWD):/app \
		-v /app/node_modules \
		-v /app/.next \
		gitbook-manual:dev

# Docker Compose commands
.PHONY: up
up:
	docker-compose up -d gitbook-app

.PHONY: up-dev
up-dev:
	docker-compose --profile dev up -d gitbook-dev

.PHONY: down
down:
	docker-compose down

# Show logs
.PHONY: logs
logs:
	docker-compose logs -f

# Enter container shell
.PHONY: shell
shell:
	docker exec -it gitbook-manual sh

# Clean up
.PHONY: clean
clean:
	docker-compose down -v
	docker rmi gitbook-manual:latest gitbook-manual:dev || true
	docker system prune -f