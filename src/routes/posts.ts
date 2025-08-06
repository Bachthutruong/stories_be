import express from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';
import Like from '../models/Like';
import { auth } from '../middleware/auth';
import cloudinary from '../config/cloudinary';
import jwt from 'jsonwebtoken';
import multer from 'multer';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Cloudinary free plan limit)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ 
      isHidden: false,
      status: 'published'
    })
      .populate('userId', 'name phoneNumber email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own posts (must be before /:id route)
router.get('/my-posts', auth, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ userId })
      .populate('userId', 'name phoneNumber email')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name phoneNumber email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post with automatic account creation
router.post('/create-with-account', upload.array('images', 5), async (req, res) => {
  try {
    // Parse FormData
    const title = req.body.title;
    const description = req.body.description;
    const content = req.body.content;
    const contactInfo = JSON.parse(req.body.contactInfo);
    const { name, phoneNumber, email } = contactInfo || {};

    if (!name || !phoneNumber || !email) {
      return res.status(400).json({ message: 'Name, phone number, and email are required' });
    }

    // Try to find existing user by phone number only
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // Create new user (not admin) - only when phone number is unique
      user = new User({
        name,
        phoneNumber,
        email,
        password: '', // No password required
        role: 'user', // Explicitly set as user, not admin
      });
      await user.save();
    } else {
      // User exists with same phone number, update name and email if needed
      if (user.name !== name || user.email !== email) {
        user.name = name;
        user.email = email;
        await user.save();
      }
    }

    // Upload images if any
    let uploadedImages: Array<{ url: string; public_id: string }> = [];
    
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          // Convert file buffer to base64 for Cloudinary
          const base64String = file.buffer.toString('base64');
          const dataURI = `data:${file.mimetype};base64,${base64String}`;
          
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'posts',
            resource_type: 'auto',
          });
          
          uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
        }
      }
    }

    // Generate postId
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    
    // Get count of posts for today to create sequential number
    const todayPosts = await Post.countDocuments({
      createdAt: {
        $gte: new Date(year, now.getMonth(), now.getDate()),
        $lt: new Date(year, now.getMonth(), now.getDate() + 1)
      }
    });
    
    const sequentialNumber = (todayPosts + 1).toString().padStart(3, '0');
    const postId = `${year}_${month}_${day}_${hours}_HEMUNG_${sequentialNumber}`;

    const post = new Post({
      postId,
      userId: user._id,
      title,
      description,
      content: content || description, // Use content if provided, otherwise use description
      images: uploadedImages,
      contactInfo: contactInfo || null, // Store contact info if provided
      status: 'published', // Explicitly set as published
      isHidden: false, // Explicitly set as not hidden
    });

    await post.save();

    // Create token for the user
    const payload = {
      userId: user._id,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          post,
          token,
          user: {
            id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, async (req: any, res) => {
  try {
    const { title, description, content, images, contactInfo } = req.body;

    // Generate postId
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    
    // Get count of posts for today to create sequential number
    const todayPosts = await Post.countDocuments({
      createdAt: {
        $gte: new Date(year, now.getMonth(), now.getDate()),
        $lt: new Date(year, now.getMonth(), now.getDate() + 1)
      }
    });
    
    const sequentialNumber = (todayPosts + 1).toString().padStart(3, '0');
    const postId = `${year}_${month}_${day}_${hours}_HEMUNG_${sequentialNumber}`;

    // Validate images from Cloudinary
    const validatedImages = images ? images.filter((img: any) => 
      img.url && img.public_id && img.url.includes('cloudinary.com')
    ) : [];

    const post = new Post({
      postId,
      userId: req.user._id,
      title,
      description,
      content: content || description, // Use content if provided, otherwise use description
      images: validatedImages,
      contactInfo: contactInfo || null, // Store contact info if provided
      status: 'published', // Explicitly set as published
      isHidden: false, // Explicitly set as not hidden
    });

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', auth, async (req: any, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post or is admin
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { title, description, content, images, contactInfo } = req.body;
    
    // If images are being updated, delete old images from Cloudinary
    if (images && images.length !== post.images.length) {
      for (const oldImage of post.images) {
        try {
          await cloudinary.uploader.destroy(oldImage.public_id);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }
    
    // Validate new images from Cloudinary
    const validatedImages = images ? images.filter((img: any) => 
      img.url && img.public_id && img.url.includes('cloudinary.com')
    ) : post.images;
    
    post.title = title || post.title;
    post.description = description || post.description;
    post.content = content || post.content;
    post.images = validatedImages;
    post.contactInfo = contactInfo || post.contactInfo;
    
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Delete post (only by owner or admin)
router.delete('/:id', auth, async (req: any, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Only owner or admin can delete
    if (post.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user liked a post
router.get('/:id/like-status', auth, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const existingLike = await Like.findOne({ userId, postId: req.params.id });
    
    res.json({ isLiked: !!existingLike });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like post
router.post('/:id/like', auth, async (req: any, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const userId = req.user._id;
    
    // Check if user already liked this post
    const existingLike = await Like.findOne({ userId, postId: req.params.id });
    
    if (existingLike) {
      // Unlike: remove the like
      await Like.findByIdAndDelete(existingLike._id);
      post.likes = Math.max(0, post.likes - 1);
      await post.save();
      
      res.json({ 
        likes: post.likes, 
        isLiked: false,
        message: 'Post unliked successfully' 
      });
    } else {
      // Like: add the like
      const newLike = new Like({ userId, postId: req.params.id });
      await newLike.save();
      post.likes += 1;
      await post.save();
      
      res.json({ 
        likes: post.likes, 
        isLiked: true,
        message: 'Post liked successfully' 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share post
router.post('/:id/share', auth, async (req: any, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.shares += 1;
    await post.save();
    
    res.json({ shares: post.shares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured posts
router.get('/featured/featured', async (req, res) => {
  try {
    const featuredPosts = await Post.find({ 
      isFeatured: true, 
      isHidden: false 
    })
      .populate('userId', 'name phoneNumber email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(featuredPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending posts (by likes)
router.get('/trending/likes', async (req, res) => {
  try {
    const trendingPosts = await Post.find({ isHidden: false })
      .populate('userId', 'name phoneNumber email')
      .sort({ likes: -1, createdAt: -1 })
      .limit(10);
    
    res.json(trendingPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending posts (by shares)
router.get('/trending/shares', async (req, res) => {
  try {
    const trendingPosts = await Post.find({ isHidden: false })
      .populate('userId', 'name phoneNumber email')
      .sort({ shares: -1, createdAt: -1 })
      .limit(10);
    
    res.json(trendingPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .populate('userId', 'name phoneNumber email')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to a post
router.post('/:id/comments', auth, async (req: any, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const comment = new Comment({
      postId: req.params.id,
      userId: req.user._id,
      content: content.trim(),
      userIp: req.ip || req.connection.remoteAddress || 'unknown',
    });
    
    await comment.save();
    
    // Update post comment count
    const post = await Post.findById(req.params.id);
    if (post) {
      post.commentsCount += 1;
      await post.save();
    }
    
    // Populate user info before sending response
    await comment.populate('userId', 'name phoneNumber email');
    
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 