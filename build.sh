#!/bin/bash
# Build script for Netlify deployment

echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building the project..."
npm run build

echo "✅ Build completed successfully!"

# List the build output
echo "📁 Build output:"
ls -la dist/