const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Report = require('./models/Report');
const Keyword = require('./models/Keyword');
const Lottery = require('./models/Lottery');
const Like = require('./models/Like');

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stories_post');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Report.deleteMany({});
    await Keyword.deleteMany({});
    await Lottery.deleteMany({});
    await Like.deleteMany({});

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      phoneNumber: '0912345678',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    // Create regular users
    const user1 = await User.create({
      name: 'John Doe',
      phoneNumber: '0923456789',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user',
      status: 'active'
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      phoneNumber: '0934567890',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      role: 'user',
      status: 'active'
    });

    // Create posts
    const post1 = await Post.create({
      postId: 'POST001',
      title: 'My Dream Vacation',
      description: 'I want to travel around the world',
      content: 'I have always dreamed of traveling around the world. I want to visit different countries, experience different cultures, and meet new people. This has been my dream since I was a child.',
      userId: user1._id,
      status: 'published'
    });

    const post2 = await Post.create({
      postId: 'POST002',
      title: 'Starting My Own Business',
      description: 'My entrepreneurial journey',
      content: 'I want to start my own business. I have been working on a business plan for months and I am excited to finally take the leap. I believe this will be the best decision of my life.',
      userId: user2._id,
      status: 'published'
    });

    // Create comments
    await Comment.create({
      content: 'Great dream! I hope you achieve it.',
      userId: user2._id,
      postId: post1._id,
      userIp: '192.168.1.1',
      status: 'approved'
    });

    await Comment.create({
      content: 'Good luck with your business!',
      userId: user1._id,
      postId: post2._id,
      userIp: '192.168.1.2',
      status: 'approved'
    });

    // Create likes
    await Like.create({
      userId: user1._id,
      postId: post2._id
    });

    await Like.create({
      userId: user2._id,
      postId: post1._id
    });

    // Update post like counts
    await Post.findByIdAndUpdate(post1._id, { likes: 1 });
    await Post.findByIdAndUpdate(post2._id, { likes: 1 });

    // Create reports
    await Report.create({
      reason: 'spam',
      description: 'This post seems like spam',
      userId: user1._id,
      postId: post2._id,
      status: 'pending'
    });

    // Create keywords
    await Keyword.create({
      word: 'spam',
      action: 'block',
      severity: 'high'
    });

    await Keyword.create({
      word: 'inappropriate',
      action: 'flag',
      severity: 'medium'
    });

    await Keyword.create({
      word: 'copyright',
      action: 'review',
      severity: 'low'
    });

    // Create lottery
    await Lottery.create({
      name: 'Dream Lottery 2024',
      description: 'Win amazing prizes for your dreams',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      prize: 'iPhone 15 Pro',
      maxParticipants: 100,
      status: 'active',
      participants: []
    });

    console.log('Seed data created successfully!');
    console.log('Admin credentials:');
    console.log('Phone: 0912345678');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 