import express from 'express';
import Report from '../models/Report';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create a new report
router.post('/', auth, async (req: any, res) => {
  try {
    const { contentType, contentId, reason, description } = req.body;
    const userId = req.user._id;

    if (!contentType || !contentId || !reason) {
      return res.status(400).json({ message: 'Content type, content ID, and reason are required' });
    }

    // Check if user has already reported this content
    const existingReport = await Report.findOne({
      userId,
      contentType,
      contentId,
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this content' });
    }

    const report = new Report({
      userId,
      contentType,
      contentId,
      reason,
      description: description || '',
      status: 'pending',
    });

    await report.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report: {
        id: report._id,
        contentType: report.contentType,
        contentId: report.contentId,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('Report creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reports (admin only)
router.get('/', auth, async (req: any, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const reports = await Report.find()
      .populate('userId', 'name email phoneNumber')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status (admin only)
router.put('/:id/status', auth, async (req: any, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body;

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'name email phoneNumber');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      message: 'Report status updated successfully',
      report,
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report statistics (admin only)
router.get('/stats', auth, async (req: any, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      total: totalReports,
      pending: pendingReports,
      byStatus: stats,
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 