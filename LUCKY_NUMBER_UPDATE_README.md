# Lucky Number Update Scripts

This directory contains scripts to update existing posts with lucky numbers in the database.

## Overview

The lucky number system assigns sequential numbers (001-999, then reset to 001) to posts based on their creation date. This ensures a fair and predictable lottery system.

## Scripts

### 1. `backup-posts.js`
Creates a backup of all posts before making changes.
- **Usage**: `node backup-posts.js`
- **Output**: Creates `./backups/posts-backup-{timestamp}.json`

### 2. `preview-update.js`
Shows what changes will be made without actually updating the database.
- **Usage**: `node preview-update.js`
- **Output**: Displays a table of posts that will be updated

### 3. `update-existing-posts.js`
Actually updates the posts with lucky numbers.
- **Usage**: `node update-existing-posts.js`
- **Output**: Updates all posts without lucky numbers

### 4. `run-lucky-number-update.sh`
Main script that runs all steps in sequence.
- **Usage**: `./run-lucky-number-update.sh`
- **Steps**:
  1. Creates backup
  2. Shows preview
  3. Asks for confirmation
  4. Updates posts
  5. Shows results

## How to Use

### Option 1: Run the complete script (Recommended)
```bash
cd backend
./run-lucky-number-update.sh
```

### Option 2: Run individual steps
```bash
cd backend

# Step 1: Create backup
node backup-posts.js

# Step 2: Preview changes
node preview-update.js

# Step 3: Update posts (after reviewing preview)
node update-existing-posts.js
```

## What the Scripts Do

### Lucky Number Assignment Logic
- Posts are sorted by creation date (oldest first)
- Lucky numbers are assigned sequentially: 001, 002, 003, ..., 999
- After 999, the sequence resets to 001
- Posts that already have lucky numbers are not changed

### Example Sequence
```
Post 1 (oldest)  → 001
Post 2          → 002
Post 3          → 003
...
Post 999        → 999
Post 1000       → 001 (reset)
Post 1001       → 002
```

## Safety Features

1. **Backup**: Always creates a backup before making changes
2. **Preview**: Shows exactly what will be changed before doing it
3. **Confirmation**: Asks for user confirmation before updating
4. **Non-destructive**: Only adds lucky numbers, doesn't modify existing data
5. **Idempotent**: Can be run multiple times safely

## Requirements

- Node.js installed
- MongoDB connection configured
- Environment variables set (MONGODB_URI, etc.)

## Troubleshooting

### If the script fails:
1. Check MongoDB connection
2. Verify environment variables
3. Check file permissions
4. Review error messages

### If you need to restore:
1. Use the backup files in `./backups/` directory
2. Import the JSON backup into MongoDB
3. Or write a custom restore script

## File Structure

```
backend/
├── backup-posts.js              # Creates backup
├── preview-update.js            # Shows preview
├── update-existing-posts.js     # Updates posts
├── run-lucky-number-update.sh   # Main script
├── backups/                     # Backup files (created automatically)
└── LUCKY_NUMBER_UPDATE_README.md # This file
```

## Notes

- The scripts use the same Post model as your application
- Lucky numbers are stored as strings (e.g., "001", "002")
- The system is designed to be backward compatible
- Posts created after this update will automatically get lucky numbers
