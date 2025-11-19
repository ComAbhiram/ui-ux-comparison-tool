#!/bin/bash

# UI/UX Comparison Tool - LocalTunnel Deployment Script
# This script sets up and runs the application with LocalTunnel for public access

echo "🚀 Starting UI/UX Comparison Tool with LocalTunnel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v lt &> /dev/null; then
        print_status "LocalTunnel is not installed. Installing..."
        npm install -g localtunnel
    fi
    
    print_success "All requirements met!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_success "Dependencies installed!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy example env files if .env doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        print_warning "Created .env file. Please update it with your Supabase credentials."
    fi
    
    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        print_warning "Created backend/.env file. Please update it with your Supabase credentials."
    fi
    
    print_success "Environment files ready!"
}

# Build the frontend
build_frontend() {
    print_status "Building frontend..."
    npm run build
    print_success "Frontend built successfully!"
}

# Start the backend server
start_backend() {
    print_status "Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    sleep 3
    print_success "Backend server started (PID: $BACKEND_PID)"
}

# Serve the frontend
serve_frontend() {
    print_status "Starting frontend server..."
    npm run preview &
    FRONTEND_PID=$!
    sleep 3
    print_success "Frontend server started (PID: $FRONTEND_PID)"
}

# Start LocalTunnel
start_tunnel() {
    print_status "Starting LocalTunnel for frontend..."
    lt --port 4173 --subdomain ui-ux-tool-frontend &
    TUNNEL_PID=$!
    sleep 3
    print_success "LocalTunnel started for frontend!"
    
    print_status "Starting LocalTunnel for backend..."
    lt --port 5000 --subdomain ui-ux-tool-backend &
    TUNNEL_BACKEND_PID=$!
    sleep 3
    print_success "LocalTunnel started for backend!"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    if [ ! -z "$TUNNEL_PID" ]; then
        kill $TUNNEL_PID 2>/dev/null
    fi
    if [ ! -z "$TUNNEL_BACKEND_PID" ]; then
        kill $TUNNEL_BACKEND_PID 2>/dev/null
    fi
    print_success "Cleanup completed!"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Main execution
main() {
    echo "======================================"
    echo "   UI/UX Comparison Tool Deployment   "
    echo "======================================"
    echo ""
    
    check_requirements
    install_dependencies
    setup_environment
    build_frontend
    start_backend
    serve_frontend
    start_tunnel
    
    echo ""
    echo "======================================"
    print_success "🎉 Deployment Complete!"
    echo "======================================"
    echo ""
    print_status "Your application is now running with the following URLs:"
    echo ""
    print_status "📱 Frontend: https://ui-ux-tool-frontend.loca.lt"
    print_status "🔧 Backend: https://ui-ux-tool-backend.loca.lt"
    print_status "🏠 Local Frontend: http://localhost:4173"
    print_status "🏠 Local Backend: http://localhost:5000"
    echo ""
    print_warning "If subdomains are taken, LocalTunnel will assign random URLs"
    print_warning "Update your frontend API configuration to use the backend tunnel URL"
    print_status "Press Ctrl+C to stop all services"
    echo ""
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main