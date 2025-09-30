const mongoose = require('mongoose');
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

// Function to generate lucky number in sequence
function generateLuckyNumber(sequenceNumber) {
  const number = ((sequenceNumber - 1) % 999) + 1;
  return number.toString().padStart(3, '0');
}

async function previewUpdate() {
  try {
    console.log('🔍 Previewing lucky number updates...\n');

    // Get all posts sorted by creation date
    const posts = await Post.find({})
      .sort({ createdAt: 1 })
      .select('_id postId title createdAt luckyNumber');

    console.log(`📊 Found ${posts.length} posts in database\n`);

    if (posts.length === 0) {
      console.log('ℹ️  No posts found');
      return;
    }

    // Analyze current state
    const postsWithLuckyNumbers = posts.filter(post => post.luckyNumber);
    const postsWithoutLuckyNumbers = posts.filter(post => !post.luckyNumber);

    console.log('📈 Current state:');
    console.log(`  - Posts with lucky numbers: ${postsWithLuckyNumbers.length}`);
    console.log(`  - Posts without lucky numbers: ${postsWithoutLuckyNumbers.length}\n`);

    if (postsWithoutLuckyNumbers.length === 0) {
      console.log('✅ All posts already have lucky numbers!');
      return;
    }

    // Find starting point
    let highestLuckyNumber = 0;
    if (postsWithLuckyNumbers.length > 0) {
      const existingNumbers = postsWithLuckyNumbers
        .map(post => parseInt(post.luckyNumber))
        .filter(num => !isNaN(num));
      
      if (existingNumbers.length > 0) {
        highestLuckyNumber = Math.max(...existingNumbers);
      }
    }

    console.log(`🎯 Will start from lucky number: ${(highestLuckyNumber + 1).toString().padStart(3, '0')}\n`);

    // Preview what will be updated
    console.log('📋 Preview of updates:');
    console.log('=' .repeat(80));
    console.log('| Post ID | Title (truncated) | Current | New Lucky | Created Date |');
    console.log('=' .repeat(80));

    let currentSequence = highestLuckyNumber + 1;
    let updateCount = 0;

    for (const post of postsWithoutLuckyNumbers) {
      const luckyNumber = generateLuckyNumber(currentSequence);
      const title = post.title.length > 20 ? post.title.substring(0, 17) + '...' : post.title;
      const createdDate = new Date(post.createdAt).toLocaleDateString();
      
      console.log(`| ${post._id.toString().substring(0, 8)}... | ${title.padEnd(20)} | ${'N/A'.padEnd(7)} | ${luckyNumber.padEnd(10)} | ${createdDate.padEnd(12)} |`);
      
      currentSequence++;
      updateCount++;
    }

    console.log('=' .repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`  - Total posts: ${posts.length}`);
    console.log(`  - Posts to update: ${updateCount}`);
    console.log(`  - Lucky number range: ${(highestLuckyNumber + 1).toString().padStart(3, '0')} - ${generateLuckyNumber(highestLuckyNumber + updateCount)}`);

    // Show existing lucky numbers
    if (postsWithLuckyNumbers.length > 0) {
      console.log(`\n🔢 Existing lucky numbers:`);
      const existingNumbers = postsWithLuckyNumbers
        .map(post => parseInt(post.luckyNumber))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);
      
      console.log(`  Range: ${Math.min(...existingNumbers).toString().padStart(3, '0')} - ${Math.max(...existingNumbers).toString().padStart(3, '0')}`);
      console.log(`  Count: ${existingNumbers.length}`);
    }

    console.log('\n💡 To apply these updates, run: node update-existing-posts.js');

  } catch (error) {
    console.error('❌ Error previewing updates:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await previewUpdate();
  } catch (error) {
    console.error('❌ Preview failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  main();
}
