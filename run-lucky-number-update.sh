#!/bin/bash

# Script to update existing posts with lucky numbers
# This script will:
# 1. Create a backup of existing posts
# 2. Preview the changes that will be made
# 3. Update posts with lucky numbers
# 4. Verify the results

echo "🎲 Lucky Number Update Script"
echo "=============================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

echo "📋 Step 1: Creating backup of existing posts..."
echo "----------------------------------------------"
node backup-posts.js
if [ $? -ne 0 ]; then
    echo "❌ Backup failed. Aborting."
    exit 1
fi

echo ""
echo "🔍 Step 2: Previewing changes..."
echo "--------------------------------"
node preview-update.js
if [ $? -ne 0 ]; then
    echo "❌ Preview failed. Aborting."
    exit 1
fi

echo ""
echo "⚠️  IMPORTANT: Review the preview above before proceeding!"
echo "This will update all posts without lucky numbers."
echo ""
read -p "Do you want to continue with the update? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Update cancelled by user."
    exit 0
fi

echo ""
echo "🔄 Step 3: Updating posts with lucky numbers..."
echo "----------------------------------------------"
node update-existing-posts.js
if [ $? -ne 0 ]; then
    echo "❌ Update failed. Check the error messages above."
    exit 1
fi

echo ""
echo "✅ Lucky number update completed successfully!"
echo ""
echo "📊 Summary:"
echo "- Backup created in ./backups/ directory"
echo "- All posts now have lucky numbers (001-999, then reset)"
echo "- Lucky numbers are assigned sequentially by creation date"
echo ""
echo "🚀 You can now start your application with the updated lucky number system!"
