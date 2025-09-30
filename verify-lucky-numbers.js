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

async function verifyLuckyNumbers() {
  try {
    console.log('🔍 Verifying lucky number assignments...\n');

    // Get all posts sorted by creation date
    const posts = await Post.find({})
      .sort({ createdAt: 1 })
      .select('_id postId title createdAt luckyNumber');

    console.log(`📊 Total posts: ${posts.length}`);

    if (posts.length === 0) {
      console.log('ℹ️  No posts found');
      return;
    }

    // Check posts without lucky numbers
    const postsWithoutLuckyNumbers = posts.filter(post => !post.luckyNumber);
    const postsWithLuckyNumbers = posts.filter(post => post.luckyNumber);

    console.log(`📈 Posts with lucky numbers: ${postsWithLuckyNumbers.length}`);
    console.log(`📉 Posts without lucky numbers: ${postsWithoutLuckyNumbers.length}`);

    if (postsWithoutLuckyNumbers.length > 0) {
      console.log('\n⚠️  Posts without lucky numbers:');
      postsWithoutLuckyNumbers.forEach(post => {
        console.log(`  - ${post.title} (${post._id})`);
      });
    }

    if (postsWithLuckyNumbers.length === 0) {
      console.log('\n❌ No posts have lucky numbers!');
      return;
    }

    // Analyze lucky number distribution
    const luckyNumbers = postsWithLuckyNumbers
      .map(post => parseInt(post.luckyNumber))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);

    console.log(`\n🔢 Lucky number analysis:`);
    console.log(`  - Range: ${Math.min(...luckyNumbers).toString().padStart(3, '0')} - ${Math.max(...luckyNumbers).toString().padStart(3, '0')}`);
    console.log(`  - Total unique numbers: ${luckyNumbers.length}`);
    console.log(`  - Expected range: 001 - 999`);

    // Check for duplicates
    const duplicates = luckyNumbers.filter((num, index) => luckyNumbers.indexOf(num) !== index);
    if (duplicates.length > 0) {
      console.log(`\n⚠️  Duplicate lucky numbers found: ${[...new Set(duplicates)].join(', ')}`);
    } else {
      console.log(`\n✅ No duplicate lucky numbers found`);
    }

    // Check for gaps in sequence
    const gaps = [];
    for (let i = 1; i < luckyNumbers.length; i++) {
      const expected = luckyNumbers[i-1] + 1;
      if (luckyNumbers[i] !== expected) {
        gaps.push({ from: luckyNumbers[i-1], to: luckyNumbers[i] });
      }
    }

    if (gaps.length > 0) {
      console.log(`\n⚠️  Gaps in sequence found:`);
      gaps.forEach(gap => {
        console.log(`  - Gap between ${gap.from} and ${gap.to}`);
      });
    } else {
      console.log(`\n✅ Lucky numbers are in proper sequence`);
    }

    // Show sample of posts with their lucky numbers
    console.log(`\n📋 Sample of posts with lucky numbers:`);
    console.log('=' .repeat(80));
    console.log('| Lucky # | Post ID | Title (truncated) | Created Date |');
    console.log('=' .repeat(80));

    const samplePosts = postsWithLuckyNumbers.slice(0, 10);
    samplePosts.forEach(post => {
      const title = post.title.length > 20 ? post.title.substring(0, 17) + '...' : post.title;
      const createdDate = new Date(post.createdAt).toLocaleDateString();
      console.log(`| ${post.luckyNumber.padEnd(7)} | ${post._id.toString().substring(0, 8)}... | ${title.padEnd(20)} | ${createdDate.padEnd(12)} |`);
    });

    if (postsWithLuckyNumbers.length > 10) {
      console.log(`| ... ${postsWithLuckyNumbers.length - 10} more posts ... |`);
    }

    console.log('=' .repeat(80));

    // Summary
    console.log(`\n📊 Summary:`);
    console.log(`  - Total posts: ${posts.length}`);
    console.log(`  - Posts with lucky numbers: ${postsWithLuckyNumbers.length}`);
    console.log(`  - Posts without lucky numbers: ${postsWithoutLuckyNumbers.length}`);
    console.log(`  - Duplicate numbers: ${duplicates.length > 0 ? 'Yes' : 'No'}`);
    console.log(`  - Sequence gaps: ${gaps.length > 0 ? 'Yes' : 'No'}`);

    if (postsWithoutLuckyNumbers.length === 0 && duplicates.length === 0 && gaps.length === 0) {
      console.log(`\n🎉 All lucky numbers are properly assigned!`);
    } else {
      console.log(`\n⚠️  Some issues found. You may need to run the update script again.`);
    }

  } catch (error) {
    console.error('❌ Error verifying lucky numbers:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await verifyLuckyNumbers();
  } catch (error) {
    console.error('❌ Verification failed:', error);
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
