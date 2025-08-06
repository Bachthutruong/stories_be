#!/bin/bash

echo "🧹 Cleaning previous build..."
rm -rf dist/

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed!"
echo "📁 Checking dist folder..."
ls -la dist/

echo "🚀 Testing start command..."
npm start 