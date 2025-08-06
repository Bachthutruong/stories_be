import express from 'express';
import User from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Like from '../models/Like';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get user stats (must be before /:userId route)
router.get('/stats', auth, async (req: any, res) => {
  try {
    const userId = req.user._id;
    
    const [totalPosts, totalLikes, totalComments, user] = await Promise.all([
      Post.countDocuments({ userId }),
      Like.countDocuments({ postId: { $in: await Post.find({ userId }).distinct('_id') } }),
      Comment.countDocuments({ userId }),
      User.findById(userId),
    ]);
    
    res.json({
      totalPosts,
      totalLikes,
      totalComments,
      joinDate: user?.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (must be before /:userId route)
router.put('/profile', auth, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phoneNumber } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/:userId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ 
      userId: req.params.userId,
      isHidden: false 
    })
    .populate('userId', 'name phoneNumber email')
    .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 