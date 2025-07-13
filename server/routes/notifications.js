const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');

const router = express.Router();

// Get all notifications with pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      type,
      severity,
      status,
      search
    } = req.query;

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'recipients', select: 'firstName lastName email' },
        { path: 'relatedThreat', select: 'threatId type severity' }
      ]
    };

    const notifications = await Notification.paginate(query, options);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification statistics
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate, type, severity } = req.query;
    
    const filters = {};
    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (type) filters.type = type;
    if (severity) filters.severity = severity;

    const statistics = await Notification.getStatistics(filters);
    res.json(statistics);
  } catch (error) {
    console.error('Get notification statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread notifications for current user
router.get('/unread', async (req, res) => {
  try {
    const notifications = await Notification.getUnreadForUser(req.user._id);
    res.json(notifications);
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single notification by ID
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('recipients', 'firstName lastName email')
      .populate('relatedThreat', 'threatId type severity');

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new notification
router.post('/', [
  body('title').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('type').isIn(['email', 'slack', 'webhook', 'in_app', 'sms']),
  body('severity').isIn(['info', 'warning', 'error', 'critical']),
  body('recipients').isArray(),
  body('channels').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const {
      title,
      message,
      type,
      severity,
      recipients,
      channels,
      relatedThreat,
      scheduledFor,
      metadata
    } = req.body;

    const notificationData = {
      title,
      message,
      type,
      severity,
      recipients,
      channels: channels || [type],
      relatedThreat,
      scheduledFor,
      metadata
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      recipients.forEach(recipientId => {
        io.to(`dashboard-${recipientId}`).emit('new-notification', notification);
      });
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification
router.put('/:id', [
  body('title').optional().notEmpty().trim(),
  body('message').optional().notEmpty().trim(),
  body('severity').optional().isIn(['info', 'warning', 'error', 'critical']),
  body('status').optional().isIn(['pending', 'sent', 'delivered', 'failed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('recipients', 'firstName lastName email');

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead(req.user._id);
    
    const updatedNotification = await Notification.findById(req.params.id)
      .populate('recipients', 'firstName lastName email');

    res.json(updatedNotification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend notification
router.post('/:id/resend', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.resend();
    
    res.json({ message: 'Notification queued for resend' });
  } catch (error) {
    console.error('Resend notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk mark notifications as read
router.post('/mark-read', [
  body('notificationIds').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Notification IDs array is required' });
    }

    const { notificationIds } = req.body;

    await Promise.all(
      notificationIds.map(id => 
        Notification.findByIdAndUpdate(id, {
          $addToSet: { 'readBy': { user: req.user._id, readAt: new Date() } }
        })
      )
    );

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Bulk mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 