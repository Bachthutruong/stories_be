import express from 'express';
import Post from '../models/Post';
import Lottery from '../models/Lottery';
import User from '../models/User';
import Keyword from '../models/Keyword';

const router = express.Router();

// Root endpoint
router.get('/', async (req, res) => {
  try {
    // Get featured posts
    const featuredPosts = await Post.find({ 
      isFeatured: true, 
      isHidden: false 
    })
    .populate('userId', 'name phoneNumber email')
    .sort({ createdAt: -1 })
    .limit(6);

    // Get top liked posts
    const topLikedPosts = await Post.find({ 
      isHidden: false 
    })
    .populate('userId', 'name phoneNumber email')
    .sort({ likes: -1 })
    .limit(6);

    // Get top shared posts
    const topSharedPosts = await Post.find({ 
      isHidden: false 
    })
    .populate('userId', 'name phoneNumber email')
    .sort({ shares: -1 })
    .limit(6);

    // Get top commented posts
    const topCommentedPosts = await Post.find({ 
      isHidden: false 
    })
    .populate('userId', 'name phoneNumber email')
    .sort({ commentsCount: -1 })
    .limit(6);

    res.json({
      featuredPosts,
      topLikedPosts,
      topSharedPosts,
      topCommentedPosts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured posts
router.get('/featured', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name phoneNumber email')
      .sort({ likes: -1, createdAt: -1 })
      .limit(10);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent posts
router.get('/recent', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name phoneNumber email')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sensitive keywords (public endpoint)
router.get('/keywords', async (req, res) => {
  try {
    const keywords = await Keyword.find().sort({ createdAt: -1 });
    res.json(keywords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get lottery winners (public endpoint)
router.get('/lottery/winners', async (req, res) => {
  try {
    const winners = await Lottery.find({ 
      status: 'completed',
      winner: { $exists: true, $ne: null }
    })
    .populate('winner', 'name phoneNumber email')
    .sort({ drawnAt: -1 });
    
    res.json(winners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current lotteries (public endpoint)
router.get('/lottery/current', async (req, res) => {
  try {
    const currentLotteries = await Lottery.find({ 
      status: { $in: ['upcoming', 'active'] }
    })
    .populate('participants', 'name phoneNumber email')
    .sort({ startDate: 1 });
    
    res.json(currentLotteries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create test lottery data (for development only)
router.post('/lottery/test-data', async (req, res) => {
  try {
    // Clear existing test data
    await Lottery.deleteMany({ name: { $regex: /^Test Lottery/ } });
    
    // Create multiple test lotteries with winners
    const testLotteries = [
      {
        name: "Test Lottery Tháng 1 - 2025",
        description: "Cuộc xổ số đầu năm với giải thưởng hấp dẫn",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
        prize: "$2000",
        maxParticipants: 150,
        status: "completed",
        winner: "688c46d0d413b7089aca8cba",
        drawnAt: new Date("2025-02-01"),
        participants: ["688c46d0d413b7089aca8cba", "688c46d0d413b7089aca8cbb"]
      },
      {
        name: "Test Lottery Tháng 2 - 2025",
        description: "Cuộc xổ số tháng 2 với nhiều phần quà giá trị",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-02-28"),
        prize: "$1500",
        maxParticipants: 200,
        status: "completed",
        winner: "688c46d0d413b7089aca8cba",
        drawnAt: new Date("2025-03-01"),
        participants: ["688c46d0d413b7089aca8cba", "688c46d0d413b7089aca8cbb", "688c46d0d413b7089aca8cbc"]
      },
      {
        name: "Test Lottery Tháng 3 - 2025",
        description: "Cuộc xổ số mùa xuân với giải thưởng đặc biệt",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-03-31"),
        prize: "$3000",
        maxParticipants: 300,
        status: "completed",
        winner: "688c46d0d413b7089aca8cba",
        drawnAt: new Date("2025-04-01"),
        participants: ["688c46d0d413b7089aca8cba", "688c46d0d413b7089aca8cbb", "688c46d0d413b7089aca8cbc", "688c46d0d413b7089aca8cbd"]
      },
      {
        name: "Test Lottery Tháng 4 - 2025",
        description: "Cuộc xổ số tháng 4 với nhiều cơ hội trúng giải",
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-04-30"),
        prize: "$2500",
        maxParticipants: 250,
        status: "completed",
        winner: "688c46d0d413b7089aca8cba",
        drawnAt: new Date("2025-05-01"),
        participants: ["688c46d0d413b7089aca8cba", "688c46d0d413b7089aca8cbb", "688c46d0d413b7089aca8cbc"]
      },
      {
        name: "Test Lottery Tháng 5 - 2025",
        description: "Cuộc xổ số tháng 5 với giải thưởng lớn",
        startDate: new Date("2025-05-01"),
        endDate: new Date("2025-05-31"),
        prize: "$5000",
        maxParticipants: 500,
        status: "completed",
        winner: "688c46d0d413b7089aca8cba",
        drawnAt: new Date("2025-06-01"),
        participants: ["688c46d0d413b7089aca8cba", "688c46d0d413b7089aca8cbb", "688c46d0d413b7089aca8cbc", "688c46d0d413b7089aca8cbd", "688c46d0d413b7089aca8cbe"]
      }
    ];

    const createdLotteries = [];
    for (const lotteryData of testLotteries) {
      const lottery = new Lottery(lotteryData);
      await lottery.save();
      createdLotteries.push(lottery);
    }
    
    res.json({ 
      message: "Test lottery data created successfully", 
      count: createdLotteries.length,
      lotteries: createdLotteries 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create test keywords data (for development only)
router.post('/keywords/test-data', async (req, res) => {
  try {
    const Keyword = require('../models/Keyword').default;
    
    const testKeywords = [
      {
        word: 'spam',
        action: 'block',
        severity: 'high'
      },
      {
        word: 'inappropriate',
        action: 'flag',
        severity: 'medium'
      },
      {
        word: 'violence',
        action: 'block',
        severity: 'high'
      },
      {
        word: 'hate',
        action: 'block',
        severity: 'high'
      },
      {
        word: 'scam',
        action: 'flag',
        severity: 'medium'
      }
    ];

    for (const keywordData of testKeywords) {
      const keyword = new Keyword(keywordData);
      await keyword.save();
    }

    res.json({ message: 'Test keywords data created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create test reports data (for development only)
router.post('/reports/test-data', async (req, res) => {
  try {
    const Report = require('../models/Report').default;
    const Post = require('../models/Post').default;
    
    // Get first post ID
    const firstPost = await Post.findOne();
    if (!firstPost) {
      return res.status(400).json({ message: 'No posts found to create reports for' });
    }
    
    const testReports = [
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        reason: "inappropriate",
        description: "This post contains inappropriate content",
        status: "pending"
      },
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        reason: "spam",
        description: "This post appears to be spam",
        status: "resolved"
      },
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        reason: "copyright",
        description: "This post contains copyrighted content",
        status: "pending"
      },
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        reason: "other",
        description: "This post contains other violations",
        status: "resolved"
      }
    ];

    for (const reportData of testReports) {
      const report = new Report(reportData);
      await report.save();
    }

    res.json({ message: 'Test reports data created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create test comments data (for development only)
router.post('/comments/test-data', async (req, res) => {
  try {
    const Comment = require('../models/Comment').default;
    const Post = require('../models/Post').default;
    
    // Get first post ID
    const firstPost = await Post.findOne();
    if (!firstPost) {
      return res.status(400).json({ message: 'No posts found to create comments for' });
    }
    
    const testComments = [
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        content: "Great post! I really enjoyed reading this.",
        userIp: "127.0.0.1"
      },
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        content: "Thanks for sharing your dream with us!",
        userIp: "127.0.0.1"
      },
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        content: "This is very inspiring. Keep going!",
        userIp: "127.0.0.1"
      },
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        content: "I have a similar dream too!",
        userIp: "127.0.0.1"
      },
      {
        postId: firstPost._id,
        userId: "688c46d0d413b7089aca8cba",
        content: "Beautiful story, thank you for sharing.",
        userIp: "127.0.0.1"
      }
    ];

    for (const commentData of testComments) {
      const comment = new Comment(commentData);
      await comment.save();
    }

    res.json({ message: 'Test comments data created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create test posts data (for development only)
router.post('/posts/test-data', async (req, res) => {
  try {
    
    // Create test posts with different stats
    const testPosts = [
      {
        postId: "2025_01_01_12_HEMUNG_001",
        title: "我的夢想是環遊世界",
        description: "想要走遍世界的每個角落，體驗不同的文化",
        content: "從小就夢想著能夠環遊世界，體驗不同的文化，品嚐各地的美食。希望有一天能夠實現這個夢想。",
        userId: "688c46d0d413b7089aca8cba",
        isFeatured: true,
        likes: 25,
        shares: 10,
        commentsCount: 8,
        isHidden: false
      },
      {
        postId: "2025_01_01_12_HEMUNG_002",
        title: "希望成為一名醫生",
        description: "想要幫助更多的人，救死扶傷",
        content: "從小就立志要成為一名醫生，希望能夠幫助更多的人，救死扶傷。這是我最大的夢想。",
        userId: "688c46d0d413b7089aca8cba",
        isFeatured: true,
        likes: 42,
        shares: 15,
        commentsCount: 12,
        isHidden: false
      },
      {
        postId: "2025_01_01_12_HEMUNG_003",
        title: "想要開一家咖啡店",
        description: "希望能夠開一家溫馨的咖啡店",
        content: "夢想開一家溫馨的咖啡店，讓客人能夠在這裡放鬆心情，享受美好的時光。",
        userId: "688c46d0d413b7089aca8cba",
        isFeatured: false,
        likes: 18,
        shares: 5,
        commentsCount: 15,
        isHidden: false
      },
      {
        postId: "2025_01_01_12_HEMUNG_004",
        title: "希望學會彈鋼琴",
        description: "想要彈出優美的旋律",
        content: "從小就喜歡音樂，希望能夠學會彈鋼琴，彈出優美的旋律，讓音樂感動人心。",
        userId: "688c46d0d413b7089aca8cba",
        isFeatured: false,
        likes: 30,
        shares: 8,
        commentsCount: 20,
        isHidden: false
      },
      {
        postId: "2025_01_01_12_HEMUNG_005",
        title: "想要寫一本書",
        description: "希望能夠寫出感動人心的故事",
        content: "夢想能夠寫一本書，寫出感動人心的故事，讓讀者能夠從中得到啟發和感動。",
        userId: "688c46d0d413b7089aca8cba",
        isFeatured: true,
        likes: 35,
        shares: 12,
        commentsCount: 18,
        isHidden: false
      },
      {
        postId: "2025_01_01_12_HEMUNG_006",
        title: "希望學會攝影",
        description: "想要捕捉世界的美好瞬間",
        content: "希望能夠學會攝影，捕捉世界的美好瞬間，記錄生活中的點點滴滴。",
        userId: "688c46d0d413b7089aca8cba",
        isFeatured: false,
        likes: 22,
        shares: 6,
        commentsCount: 25,
        isHidden: false
      }
    ];

    const createdPosts = [];
    for (const postData of testPosts) {
      const post = new Post(postData);
      await post.save();
      createdPosts.push(post);
    }

    res.json({ message: "Test posts created", posts: createdPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 