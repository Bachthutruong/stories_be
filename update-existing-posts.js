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

// Post Schema (same as in the model)
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
  // Convert sequence number to 001-999 range, then reset
  const number = ((sequenceNumber - 1) % 999) + 1;
  return number.toString().padStart(3, '0');
}

async function updateExistingPosts() {
  try {
    console.log('🔄 Starting to update existing posts with lucky numbers...\n');

    // Get all posts sorted by creation date (oldest first)
    const posts = await Post.find({})
      .sort({ createdAt: 1 })
      .select('_id postId title createdAt luckyNumber');

    console.log(`📊 Found ${posts.length} posts to update`);

    if (posts.length === 0) {
      console.log('ℹ️  No posts found to update');
      return;
    }

    // Check how many posts already have lucky numbers
    const postsWithLuckyNumbers = posts.filter(post => post.luckyNumber);
    const postsWithoutLuckyNumbers = posts.filter(post => !post.luckyNumber);

    console.log(`📈 Posts with lucky numbers: ${postsWithLuckyNumbers.length}`);
    console.log(`📉 Posts without lucky numbers: ${postsWithoutLuckyNumbers.length}\n`);

    if (postsWithoutLuckyNumbers.length === 0) {
      console.log('✅ All posts already have lucky numbers!');
      return;
    }

    // Find the highest existing lucky number to continue from there
    let highestLuckyNumber = 0;
    if (postsWithLuckyNumbers.length > 0) {
      const existingNumbers = postsWithLuckyNumbers
        .map(post => parseInt(post.luckyNumber))
        .filter(num => !isNaN(num));
      
      if (existingNumbers.length > 0) {
        highestLuckyNumber = Math.max(...existingNumbers);
      }
    }

    console.log(`🎯 Starting from lucky number: ${(highestLuckyNumber + 1).toString().padStart(3, '0')}\n`);

    // Update posts without lucky numbers
    let currentSequence = highestLuckyNumber + 1;
    let updatedCount = 0;

    for (const post of postsWithoutLuckyNumbers) {
      const luckyNumber = generateLuckyNumber(currentSequence);
      
      await Post.findByIdAndUpdate(post._id, { luckyNumber });
      
      console.log(`✅ Updated post "${post.title}" (${post._id}) with lucky number: ${luckyNumber}`);
      
      currentSequence++;
      updatedCount++;
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} posts with lucky numbers!`);

    // Display summary
    console.log('\n📋 Summary:');
    console.log(`- Total posts: ${posts.length}`);
    console.log(`- Posts with lucky numbers before: ${postsWithLuckyNumbers.length}`);
    console.log(`- Posts updated: ${updatedCount}`);
    console.log(`- Posts with lucky numbers after: ${postsWithLuckyNumbers.length + updatedCount}`);

    // Show some examples of updated posts
    console.log('\n🔍 Sample of updated posts:');
    const samplePosts = await Post.find({ luckyNumber: { $exists: true } })
      .sort({ createdAt: 1 })
      .limit(5)
      .select('title luckyNumber createdAt');
    
    samplePosts.forEach(post => {
      console.log(`  - "${post.title}" → ${post.luckyNumber} (${new Date(post.createdAt).toLocaleDateString()})`);
    });

  } catch (error) {
    console.error('❌ Error updating posts:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await updateExistingPosts();
    console.log('\n✅ Script completed successfully!');
  } catch (error) {
    console.error('❌ Script failed:', error);
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

module.exports = { updateExistingPosts, generateLuckyNumber };
