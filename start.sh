#!/bin/bash

# Build the TypeScript code
echo "Building TypeScript..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful. Starting server..."
    node dist/index.js
else
    echo "Build failed. Exiting."
    exit 1
fi 