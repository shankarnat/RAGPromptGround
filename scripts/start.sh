#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 RAG Playground Docker Setup"
echo "============================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}Please edit .env and add your API keys${NC}"
fi

# Ask user for environment
echo ""
echo "Select environment:"
echo "1) Development (with hot reloading)"
echo "2) Production"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo -e "${GREEN}Starting development environment...${NC}"
        docker-compose -f docker-compose.dev.yml up
        ;;
    2)
        echo -e "${GREEN}Starting production environment...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✅ Application is running at http://localhost:3000${NC}"
        echo "Run 'docker-compose logs -f' to view logs"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac