#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment process..."

# Check if dist directory exists and has the compiled files
if [ ! -f "dist/index.js" ]; then
    echo "Compiled JavaScript not found. Building TypeScript..."
    npm run build
fi

# Verify the build was successful
if [ ! -f "dist/index.js" ]; then
    echo "ERROR: Build failed - dist/index.js not found"
    exit 1
fi

echo "Build successful. Starting server..."
echo "Running: node dist/index.js"

# Start the server
exec node dist/index.js 