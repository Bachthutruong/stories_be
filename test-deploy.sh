#!/bin/bash

echo "Testing deployment setup..."

# Clean build
echo "1. Cleaning and building..."
npm run build

# Check if dist/index.js exists
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful - dist/index.js exists"
else
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

# Test the start script
echo "2. Testing start script..."
echo "Starting server for 3 seconds..."
npm start &
PID=$!

# Wait for server to start
sleep 3

# Check if process is running
if ps -p $PID > /dev/null 2>&1; then
    echo "✅ Server started successfully"
    kill $PID 2>/dev/null
else
    echo "❌ Server failed to start"
    exit 1
fi

echo "✅ All tests passed! Ready for deployment." 