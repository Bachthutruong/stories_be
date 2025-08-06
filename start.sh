#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting deployment process..."
echo "📁 Current directory: $(pwd)"
echo "🔧 Node.js version: $(node --version)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found. Are we in the right directory?"
    exit 1
fi

# Check if dist/index.js exists, if not, build it
if [ ! -f "dist/index.js" ]; then
    echo "⚠️  Compiled JavaScript not found. Building TypeScript..."
    npm run build
fi

# Verify the build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ ERROR: Build failed - dist/index.js not found"
    echo "📂 Files in current directory:"
    ls -la
    echo "📂 Files in dist directory (if exists):"
    ls -la dist/ 2>/dev/null || echo "  (dist directory not found)"
    exit 1
fi

echo "✅ Build successful. Starting server..."
echo "🎯 Running: node index.js"

# Start the server using our entry point
exec node index.js 