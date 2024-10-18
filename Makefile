.PHONY: dev down clean logs

# Start development environment
dev:
	docker-compose up --build

# Stop services
down:
	docker-compose down

# Clean everything
clean:
	docker-compose down -v
	docker system prune -f
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	rm -rf vendor

# View logs
logs:
	docker-compose logs -f

# View frontend logs
frontend-logs:
	docker-compose logs -f frontend