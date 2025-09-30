const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stories_post');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Post Schema
const PostSchema = new mongoose.Schema({
  postId: String,
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
  images: [{
    public_id: String,
    url: String,
  }],
  description: String,
  contactInfo: {
    name: String,
    phone: String,
    email: String,
  },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['published', 'draft', 'archived', 'pending_review', 'rejected'],
    default: 'published' 
  },
  luckyNumber: String,
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);

async function backupPosts() {
  try {
    console.log('💾 Creating backup of posts data...\n');

    // Get all posts
    const posts = await Post.find({})
      .sort({ createdAt: 1 })
      .lean(); // Use lean() for better performance

    console.log(`📊 Found ${posts.length} posts to backup`);

    if (posts.length === 0) {
      console.log('ℹ️  No posts found to backup');
      return;
    }

    // Create backup directory
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `posts-backup-${timestamp}.json`);

    // Write backup file
    const backupData = {
      timestamp: new Date().toISOString(),
      totalPosts: posts.length,
      posts: posts
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    console.log(`✅ Backup created successfully!`);
    console.log(`📁 File: ${backupFile}`);
    console.log(`📊 Posts backed up: ${posts.length}`);

    // Show summary of posts
    const postsWithLuckyNumbers = posts.filter(post => post.luckyNumber);
    const postsWithoutLuckyNumbers = posts.filter(post => !post.luckyNumber);

    console.log(`\n📈 Backup summary:`);
    console.log(`  - Posts with lucky numbers: ${postsWithLuckyNumbers.length}`);
    console.log(`  - Posts without lucky numbers: ${postsWithoutLuckyNumbers.length}`);

    // Show file size
    const stats = fs.statSync(backupFile);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  - Backup file size: ${fileSizeInMB} MB`);

    console.log(`\n💡 To restore from backup, you can use MongoDB import tools or write a restore script.`);

  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await backupPosts();
    console.log('\n✅ Backup completed successfully!');
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  main();
}
