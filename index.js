// Entry point for Render deployment
// This file ensures we run the compiled TypeScript code

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('Starting deployment process...');
console.log('Current directory:', process.cwd());
console.log('Node.js version:', process.version);

// Check if dist/index.js exists, if not, build it
const distPath = path.join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(distPath)) {
  console.log('Compiled JavaScript not found. Building TypeScript...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully.');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

// Verify the build was successful
if (!fs.existsSync(distPath)) {
  console.error('ERROR: Build failed - dist/index.js not found');
  process.exit(1);
}

console.log('Build successful. Starting server...');
console.log('Running compiled JavaScript from:', distPath);

// Run the compiled JavaScript
try {
  require('./dist/index.js');
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
} 