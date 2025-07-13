const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Basic notification info
  type: {
    type: String,
    required: true,
    enum: ['email', 'slack', 'webhook', 'in_app', 'sms']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error', 'critical']
  },
  
  // Recipients
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  channels: [{
    type: String,
    enum: ['email', 'slack', 'webhook', 'in_app', 'sms']
  }],
  
  // Related threat
  relatedThreat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat'
  },
  
  // Delivery status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Delivery attempts
  deliveryAttempts: [{
    attempt: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'failed']
    },
    error: String,
    response: mongoose.Schema.Types.Mixed
  }],
  
  // Channel-specific data
  channelData: {
    email: {
      to: [String],
      cc: [String],
      bcc: [String],
      subject: String,
      template: String,
      attachments: [{
        filename: String,
        content: String,
        contentType: String
      }]
    },
    slack: {
      channel: String,
      webhookUrl: String,
      blocks: mongoose.Schema.Types.Mixed,
      attachments: mongoose.Schema.Types.Mixed
    },
    webhook: {
      url: String,
      method: {
        type: String,
        default: 'POST'
      },
      headers: mongoose.Schema.Types.Mixed,
      payload: mongoose.Schema.Types.Mixed
    },
    sms: {
      to: [String],
      provider: String,
      messageId: String
    }
  },
  
  // Scheduling
  scheduledFor: Date,
  sentAt: Date,
  deliveredAt: Date,
  
  // Metadata
  metadata: {
    source: String,
    category: String,
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    }
  },
  
  // Read status for in-app notifications
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ severity: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ 'readBy.user': 1, createdAt: -1 });

// Pre-save middleware to set default channels
notificationSchema.pre('save', function(next) {
  if (this.channels.length === 0) {
    this.channels = [this.type];
  }
  next();
});

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadForUser = function(userId) {
  return this.find({
    recipients: userId,
    status: { $in: ['sent', 'delivered'] },
    'readBy.user': { $ne: userId }
  }).sort({ createdAt: -1 });
};

// Static method to get notification statistics
notificationSchema.statics.getStatistics = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byStatus: {
          $push: '$status'
        },
        bySeverity: {
          $push: '$severity'
        },
        byType: {
          $push: '$type'
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        sent: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || { total: 0, byStatus: [], bySeverity: [], byType: [], pending: 0, sent: 0, failed: 0 };
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
  return this.save();
};

// Instance method to add delivery attempt
notificationSchema.methods.addDeliveryAttempt = function(status, error = null, response = null) {
  this.deliveryAttempts.push({
    attempt: this.deliveryAttempts.length + 1,
    timestamp: new Date(),
    status,
    error,
    response
  });
  
  if (status === 'success') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
  } else if (this.deliveryAttempts.length >= 3) {
    this.status = 'failed';
  }
  
  return this.save();
};

// Instance method to resend notification
notificationSchema.methods.resend = function() {
  this.status = 'pending';
  this.sentAt = null;
  this.deliveredAt = null;
  return this.save();
};

// Virtual for delivery success rate
notificationSchema.virtual('deliverySuccessRate').get(function() {
  if (this.deliveryAttempts.length === 0) return 0;
  const successful = this.deliveryAttempts.filter(attempt => attempt.status === 'success').length;
  return (successful / this.deliveryAttempts.length) * 100;
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Notification', notificationSchema); 