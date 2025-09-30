const fs = require('fs');
const path = require('path');

// List of temporary files to clean up
const tempFiles = [
  'backup-posts.js',
  'preview-update.js', 
  'update-existing-posts.js',
  'verify-lucky-numbers.js',
  'cleanup-scripts.js',
  'run-lucky-number-update.sh',
  'LUCKY_NUMBER_UPDATE_README.md'
];

// List of directories to clean up
const tempDirs = [
  'backups'
];

function cleanupFiles() {
  console.log('🧹 Cleaning up temporary files...\n');

  let cleanedFiles = 0;
  let cleanedDirs = 0;

  // Clean up files
  tempFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${file}`);
        cleanedFiles++;
      } catch (error) {
        console.log(`❌ Failed to remove: ${file} - ${error.message}`);
      }
    }
  });

  // Clean up directories
  tempDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      try {
        // Remove all files in directory first
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
          fs.unlinkSync(path.join(dirPath, file));
        });
        
        // Remove directory
        fs.rmdirSync(dirPath);
        console.log(`✅ Removed directory: ${dir}`);
        cleanedDirs++;
      } catch (error) {
        console.log(`❌ Failed to remove directory: ${dir} - ${error.message}`);
      }
    }
  });

  console.log(`\n📊 Cleanup summary:`);
  console.log(`  - Files removed: ${cleanedFiles}`);
  console.log(`  - Directories removed: ${cleanedDirs}`);
  
  if (cleanedFiles > 0 || cleanedDirs > 0) {
    console.log(`\n✅ Cleanup completed!`);
  } else {
    console.log(`\nℹ️  No temporary files found to clean up.`);
  }
}

// Run cleanup
cleanupFiles();
