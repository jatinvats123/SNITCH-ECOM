.DEFAULT_GOAL := help
.PHONY: help install dev test coverage lint format build up down logs clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install root, backend and frontend dependencies
	npm run install:all

dev: ## Run backend + frontend together (API :3000, web :5173)
	npm run dev

test: ## Run the backend test suite with the coverage gate
	npm test

lint: ## Lint backend and frontend
	npm run lint

format: ## Format the whole repo with Prettier
	npm run format

build: ## Production build of the frontend
	npm run build

up: ## Start the full stack (api + web + mongo) with Docker Compose
	docker compose up --build

down: ## Stop the stack and remove volumes
	docker compose down -v

logs: ## Tail Docker Compose logs
	docker compose logs -f

clean: ## Remove build and coverage artifacts
	rm -rf frontend/dist backend/coverage
