#!/bin/bash

# 🚀 One-Command Deployment for UI/UX Comparison Tool
# This script handles everything: dependencies, environment setup, and deployment

echo "🎯 UI/UX Comparison Tool - One-Command Deployment"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_step() {
    echo -e "\n${PURPLE}[STEP]${NC} $1"
}

print_info() {
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

# Step 1: Check if .env files exist
print_step "1. Checking environment configuration..."
if [ ! -f .env ] || [ ! -f backend/.env ]; then
    print_warning "Environment files missing!"
    print_info "Creating .env files from examples..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
    fi
    
    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
    fi
    
    print_error "❌ IMPORTANT: You MUST configure your .env files with Supabase credentials!"
    echo ""
    print_info "📋 What you need to do:"
    echo "   1. Create Supabase project at https://supabase.com"
    echo "   2. Get your Project URL and API Key"
    echo "   3. Edit .env and backend/.env files"
    echo "   4. Run this script again"
    echo ""
    print_info "📖 See SUPABASE_SETUP.md and DEPLOYMENT_COMPLETE.md for detailed instructions"
    exit 1
fi

# Step 2: Install dependencies
print_step "2. Installing dependencies..."
print_info "Installing frontend dependencies..."
npm install

print_info "Installing backend dependencies..."
cd backend
npm install
cd ..

print_success "Dependencies installed!"

# Step 3: Test database connection
print_step "3. Testing database connection..."
cd backend
if npm run test-db; then
    print_success "Database connection successful!"
else
    print_error "Database connection failed!"
    print_warning "Please check your Supabase configuration in backend/.env"
    exit 1
fi
cd ..

# Step 4: Build frontend
print_step "4. Building frontend..."
npm run build
print_success "Frontend built successfully!"

# Step 5: Choose deployment method
print_step "5. Choose deployment method:"
echo "   1) Cloudflare Tunnel (Recommended - Fast & Reliable)"
echo "   2) LocalTunnel (Simple & Free)"
echo "   3) Manual setup (I'll do it myself)"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_info "Starting deployment with Cloudflare Tunnel..."
        ./deploy-cloudflare.sh
        ;;
    2)
        print_info "Starting deployment with LocalTunnel..."
        ./deploy-localtunnel.sh
        ;;
    3)
        print_info "Manual setup chosen. Here are the commands to run:"
        echo ""
        echo "Frontend:"
        echo "  npm run preview"
        echo ""
        echo "Backend:"
        echo "  cd backend && npm start"
        echo ""
        echo "Cloudflare Tunnel:"
        echo "  cloudflared tunnel --url http://localhost:4173"
        echo "  cloudflared tunnel --url http://localhost:5000"
        echo ""
        echo "LocalTunnel:"
        echo "  lt --port 4173"
        echo "  lt --port 5000"
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

print_success "🎉 Deployment setup complete!"
echo ""
print_info "📖 For detailed instructions, see DEPLOYMENT_COMPLETE.md"