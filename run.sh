#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ai-issue-agent"
IMAGE_NAME="${APP_NAME}:latest"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_DEV_FILE="docker-compose.dev.yml"

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies
install_deps() {
    print_info "Installing dependencies..."
    if command_exists bun; then
        bun install
    elif command_exists npm; then
        npm install
    else
        print_error "Neither bun nor npm found. Please install one of them."
        exit 1
    fi
}

# Function to run locally (directly on host)
run_local() {
    print_info "Running application locally..."
    if command_exists bun; then
        bun run dev
    elif command_exists npm; then
        npm run dev
    else
        print_error "Neither bun nor npm found. Please install one of them."
        exit 1
    fi
}

# Function to run via Docker
run_docker() {
    print_info "Running application via Docker..."
    
    # Check if Docker is available
    if ! command_exists docker; then
        print_error "Docker not found. Please install Docker to run the application."
        exit 1
    fi
    
    # Check if image exists, build if not
    if ! docker image inspect ${IMAGE_NAME} >/dev/null 2>&1; then
        print_warn "Docker image ${IMAGE_NAME} not found. Building it now..."
        build_image
    fi
    
    # Stop and remove existing container if it exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${APP_NAME}$"; then
        print_info "Stopping existing container..."
        docker stop ${APP_NAME} >/dev/null 2>&1 || true
        docker rm ${APP_NAME} >/dev/null 2>&1 || true
    fi
    
    # Run the container
    print_info "Starting Docker container..."
    print_info "Application will be available at http://localhost:3000"
    print_info "Press Ctrl+C to stop the container"
    
    docker run -it --rm \
        --name ${APP_NAME} \
        -p 3000:3000 \
        ${IMAGE_NAME}
}

# Function to build Docker image
build_image() {
    print_info "Building Docker image: ${IMAGE_NAME}"
    docker build -t ${IMAGE_NAME} .
    print_info "Docker image built successfully!"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command_exists docker-compose && ! docker compose version &>/dev/null; then
        print_error "docker-compose not found. Please install docker-compose."
        print_error "Docker Desktop includes docker-compose, or install with:"
        print_error "  brew install docker-compose"
        exit 1
    fi
}

# Function to get docker-compose command
docker_compose_cmd() {
    if docker compose version &>/dev/null 2>&1; then
        echo "docker compose"
    elif command_exists docker-compose; then
        echo "docker-compose"
    else
        print_error "docker-compose not available"
        exit 1
    fi
}

# Function to run with Docker Compose (development with hot reload)
run_compose_dev() {
    print_info "Running application with Docker Compose (Development mode with hot reload)..."
    
    # Check if Docker is available
    if ! command_exists docker; then
        print_error "Docker not found. Please install Docker to run the application."
        exit 1
    fi
    
    check_docker_compose
    
    COMPOSE_CMD=$(docker_compose_cmd)
    
    print_info "Starting services with Docker Compose (hot reload enabled)..."
    print_info "Changes to source files will automatically reload the application"
    print_info "Application will be available at http://localhost:3000"
    print_info "Press Ctrl+C to stop the services"
    
    $COMPOSE_CMD -f ${COMPOSE_DEV_FILE} up --build
}

# Function to run with Docker Compose (production)
run_compose() {
    print_info "Running application with Docker Compose..."
    
    # Check if Docker is available
    if ! command_exists docker; then
        print_error "Docker not found. Please install Docker to run the application."
        exit 1
    fi
    
    check_docker_compose
    
    COMPOSE_CMD=$(docker_compose_cmd)
    
    print_info "Starting services with Docker Compose..."
    print_info "Application will be available at http://localhost:3000"
    print_info "Press Ctrl+C to stop the services"
    
    $COMPOSE_CMD up --build
}

# Function to deploy with Docker Compose (background)
deploy_compose() {
    print_info "Deploying with Docker Compose..."
    
    if ! command_exists docker; then
        print_error "Docker not found. Please install Docker."
        exit 1
    fi
    
    check_docker_compose
    
    COMPOSE_CMD=$(docker_compose_cmd)
    
    print_info "Building and starting services in background..."
    $COMPOSE_CMD up -d --build
    
    print_info "Deployment completed!"
    print_info "Application is running at http://localhost:3000"
    print_info "To view logs: $COMPOSE_CMD logs -f"
    print_info "To stop: $COMPOSE_CMD down"
}

# Function to show status
show_status() {
    print_info "Docker Compose services status:"
    COMPOSE_CMD=$(docker_compose_cmd)
    # Check both dev and prod
    if $COMPOSE_CMD -f ${COMPOSE_DEV_FILE} ps 2>/dev/null | grep -q "${APP_NAME}"; then
        print_info "Development services:"
        $COMPOSE_CMD -f ${COMPOSE_DEV_FILE} ps
    elif $COMPOSE_CMD ps 2>/dev/null | grep -q "${APP_NAME}"; then
        print_info "Production services:"
        $COMPOSE_CMD ps
    else
        print_warn "No services running"
    fi
}

# Function to show logs
show_logs() {
    print_info "Showing logs for ${APP_NAME}..."
    COMPOSE_CMD=$(docker_compose_cmd)
    # Try dev first, then prod
    if $COMPOSE_CMD -f ${COMPOSE_DEV_FILE} ps 2>/dev/null | grep -q "${APP_NAME}"; then
        $COMPOSE_CMD -f ${COMPOSE_DEV_FILE} logs -f ${APP_NAME} 2>/dev/null || print_error "Could not retrieve logs"
    else
        $COMPOSE_CMD logs -f ${APP_NAME} 2>/dev/null || print_error "Could not retrieve logs"
    fi
}

# Function to stop services
stop_services() {
    print_warn "Stopping Docker Compose services..."
    COMPOSE_CMD=$(docker_compose_cmd)
    # Stop both dev and prod if running
    $COMPOSE_CMD -f ${COMPOSE_DEV_FILE} down 2>/dev/null || true
    $COMPOSE_CMD down 2>/dev/null || true
    print_info "Services stopped!"
}

# Function to delete deployment
delete_deployment() {
    print_warn "Stopping and removing Docker Compose services..."
    COMPOSE_CMD=$(docker_compose_cmd)
    # Remove both dev and prod
    $COMPOSE_CMD -f ${COMPOSE_DEV_FILE} down -v 2>/dev/null || true
    $COMPOSE_CMD down -v 2>/dev/null || true
    print_info "Services removed!"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  run         Build and run with Docker Compose (dev mode with hot reload)"
    echo "  prod        Build and run with Docker Compose (production mode)"
    echo "  install     Install dependencies"
    echo "  dev         Run application locally without Docker (development mode)"
    echo "  docker      Run application in Docker container (single container)"
    echo "  build       Build Docker image"
    echo "  deploy      Build and deploy with Docker Compose (background)"
    echo "  status      Show Docker Compose services status"
    echo "  logs        Show application logs from Docker Compose"
    echo "  stop        Stop Docker Compose services"
    echo "  delete      Stop and remove Docker Compose services"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 run              # Run with hot reload (recommended for development)"
    echo "  $0 prod             # Run in production mode"
    echo "  $0 deploy           # Deploy with Docker Compose in background"
    echo "  $0 docker           # Run in single Docker container"
    echo "  $0 dev              # Run locally without Docker"
    echo "  $0 stop             # Stop Docker Compose services"
}

# Function to check and install deps if needed
ensure_deps() {
    if [ ! -d "node_modules" ]; then
        print_info "Dependencies not found. Installing..."
        install_deps
    fi
}

# Main script logic
case "${1:-run}" in
    run)
        run_compose_dev
        ;;
    prod)
        run_compose
        ;;
    install)
        install_deps
        ;;
    dev)
        ensure_deps
        run_local
        ;;
    docker)
        run_docker
        ;;
    build)
        build_image
        ;;
    deploy)
        deploy_compose
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    stop)
        stop_services
        ;;
    delete)
        delete_deployment
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

