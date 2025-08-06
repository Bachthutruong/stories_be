import express from 'express';
import Post from '../models/Post';
import User from '../models/User';
import Comment from '../models/Comment';
import Report from '../models/Report';
import Keyword from '../models/Keyword';
import Lottery from '../models/Lottery';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// Get stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalReports = await Report.countDocuments();
    const totalKeywords = await Keyword.countDocuments();
    const totalLotteries = await Lottery.countDocuments();

    res.json({
      totalPosts,
      totalUsers,
      totalComments,
      totalReports,
      totalKeywords,
      totalLotteries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get site settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    // For now, return default settings
    // In a real app, you'd store these in a database
    const settings = {
      postCreationConfirmation: {
        title: '夢想卡上傳成功',
        message: '感謝您分享您的夢想！您的夢想卡已成功上傳並等待審核。',
        buttonText: '確定'
      },
      termsAndConditions: {
        title: '使用條款與隱私政策',
        content: '請仔細閱讀以下條款...'
      },
      contactInfo: {
        email: 'contact@example.com',
        phone: '+886 912 345 678',
        address: '台北市信義區信義路五段7號'
      },
      siteInfo: {
        name: '希望夢想牆',
        description: '分享您的夢想，讓世界看見希望',
        footerText: '© 2025 希望夢想牆. All rights reserved.'
      }
    };
    
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update site settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const settings = req.body;
    
    // In a real app, you'd save these to a database
    // For now, just return success
    console.log('Settings updated:', settings);
    
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts for admin
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name phoneNumber email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/posts/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, req.body, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/posts/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users for admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all comments for admin
router.get('/comments', adminAuth, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('userId', 'name phoneNumber email')
      .populate('postId', 'title')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/comments/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndUpdate(id, req.body, { new: true });
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/comments/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reports for admin
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('userId', 'name phoneNumber email')
      .populate('postId', 'title')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report
router.put('/reports/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndUpdate(id, req.body, { new: true });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete report
router.delete('/reports/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all keywords for admin
router.get('/keywords', adminAuth, async (req, res) => {
  try {
    const keywords = await Keyword.find().sort({ createdAt: -1 });
    res.json(keywords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create keyword
router.post('/keywords', adminAuth, async (req, res) => {
  try {
    const keyword = new Keyword(req.body);
    await keyword.save();
    res.json(keyword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update keyword
router.put('/keywords/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const keyword = await Keyword.findByIdAndUpdate(id, req.body, { new: true });
    if (!keyword) {
      return res.status(404).json({ message: 'Keyword not found' });
    }
    res.json(keyword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete keyword
router.delete('/keywords/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const keyword = await Keyword.findByIdAndDelete(id);
    if (!keyword) {
      return res.status(404).json({ message: 'Keyword not found' });
    }
    res.json({ message: 'Keyword deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all lotteries for admin
router.get('/lottery', adminAuth, async (req, res) => {
  try {
    const lotteries = await Lottery.find().sort({ createdAt: -1 });
    res.json(lotteries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new lottery
router.post('/lottery', adminAuth, async (req, res) => {
  try {
    const lottery = new Lottery(req.body);
    await lottery.save();
    res.json(lottery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update lottery
router.put('/lottery/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const lottery = await Lottery.findByIdAndUpdate(id, req.body, { new: true });
    if (!lottery) {
      return res.status(404).json({ message: 'Lottery not found' });
    }
    res.json(lottery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete lottery
router.delete('/lottery/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const lottery = await Lottery.findByIdAndDelete(id);
    if (!lottery) {
      return res.status(404).json({ message: 'Lottery not found' });
    }
    res.json({ message: 'Lottery deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Draw lottery winner
router.post('/lottery/:id/draw', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const lottery = await Lottery.findById(id);
    if (!lottery) {
      return res.status(404).json({ message: 'Lottery not found' });
    }
    
    if (lottery.status !== 'active') {
      return res.status(400).json({ message: 'Lottery is not active' });
    }
    
    if (!lottery.participants || lottery.participants.length === 0) {
      return res.status(400).json({ message: 'No participants in lottery' });
    }
    
    // Randomly select a winner
    const randomIndex = Math.floor(Math.random() * lottery.participants.length);
    const winner = lottery.participants[randomIndex];
    
    lottery.winner = winner;
    lottery.status = 'completed';
    lottery.drawnAt = new Date();
    await lottery.save();
    
    res.json({ message: 'Winner drawn successfully', winner, lottery });
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

// Create admin user (for development only)
router.post('/create-admin', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = 'admin';
    await user.save();
    
    res.json({ message: 'User updated to admin', user: {
      id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role
    }});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 