# Docker Setup for RAG Playground

This guide explains how to run the RAG Playground application using Docker and Docker Compose.

## Prerequisites

- Docker Engine (version 20.10 or later)
- Docker Compose (version 2.0 or later)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/shankarnat/RAGPlayground.git
   cd RAGPlayground
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and add your API keys.

3. **Run with Docker Compose**
   ```bash
   # For production
   docker-compose up -d

   # For development (with hot reloading)
   docker-compose -f docker-compose.dev.yml up
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:3002`

## Available Commands

### Production Mode
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Development Mode
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Rebuild containers
docker-compose -f docker-compose.dev.yml build

# Run database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:push
```

## Architecture

The application consists of:
- **app**: The main Node.js application (Express + Vite)
- **db**: PostgreSQL database
- **db-init**: Database initialization service (runs migrations)

## Environment Variables

Key environment variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Application environment (development/production)
- `OPENAI_API_KEY`: For OpenAI integrations
- `ANTHROPIC_API_KEY`: For Anthropic integrations

## Volumes

- `postgres_data`: Persists database data
- `./attached_assets`: Shared volume for document assets

## Ports

- `3002`: Application web interface
- `5432`: PostgreSQL database (exposed for development)

## Troubleshooting

### Database connection issues
```bash
# Check if database is running
docker-compose ps db

# View database logs
docker-compose logs db

# Manually run migrations
docker-compose exec app npm run db:push
```

### Permission issues
Make sure the init script is executable:
```bash
chmod +x scripts/init-db.sh
```

### Clear everything and start fresh
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## Development Workflow

1. Make changes to the code
2. The development container will automatically reload
3. For database schema changes, run migrations:
   ```bash
   docker-compose -f docker-compose.dev.yml exec app npm run db:push
   ```

## Production Deployment

For production deployment:
1. Update environment variables in `.env`
2. Build and run:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

## Security Notes

- Never commit `.env` files with real API keys
- Use strong passwords for production databases
- Consider using Docker secrets for sensitive data
- Enable SSL/TLS for production deployments