#!/bin/bash

echo "Verifying build process..."

# Clean and build
npm run build

# Check if dist/index.js exists
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful - dist/index.js exists"
    echo "File size: $(ls -lh dist/index.js | awk '{print $5}')"
    echo "First few lines of compiled file:"
    head -5 dist/index.js
else
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo "✅ Build verification complete" 