const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  // Basic threat information
  threatId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'brute_force',
      'sql_injection',
      'xss',
      'suspicious_ip',
      'geo_mismatch',
      'rate_limit_exceeded',
      'unauthorized_access',
      'data_exfiltration',
      'malware_detected',
      'ddos_attack',
      'phishing_attempt',
      'other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'investigating', 'resolved', 'false_positive', 'ignored'],
    default: 'new'
  },
  
  // Source information
  sourceIp: {
    type: String,
    required: true,
    index: true
  },
  sourceCountry: String,
  sourceCity: String,
  sourceRegion: String,
  userAgent: String,
  referer: String,
  
  // Target information
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  targetEndpoint: String,
  targetApplication: {
    type: String,
    default: 'main'
  },
  
  // Event details
  eventData: {
    action: String,
    payload: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    body: String,
    query: mongoose.Schema.Types.Mixed
  },
  
  // Threat analysis
  analysis: {
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    patterns: [String],
    indicators: [String],
    description: String,
    recommendations: [String]
  },
  
  // Geolocation data
  geolocation: {
    country: String,
    city: String,
    region: String,
    latitude: Number,
    longitude: Number,
    timezone: String,
    isp: String,
    org: String
  },
  
  // Related threats
  relatedThreats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat'
  }],
  
  // Investigation data
  investigation: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: [{
      content: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  },
  
  // Response actions
  actions: [{
    type: {
      type: String,
      enum: ['block_ip', 'lock_user', 'notify_admin', 'log_event', 'custom']
    },
    description: String,
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    executedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'executed', 'failed'],
      default: 'pending'
    }
  }],
  
  // Metadata
  metadata: {
    sessionId: String,
    requestId: String,
    correlationId: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
threatSchema.index({ createdAt: -1 });
threatSchema.index({ sourceIp: 1, createdAt: -1 });
threatSchema.index({ type: 1, severity: 1 });
threatSchema.index({ status: 1, createdAt: -1 });
threatSchema.index({ 'analysis.riskScore': -1 });
threatSchema.index({ targetApplication: 1, createdAt: -1 });

// Pre-save middleware to generate threat ID
threatSchema.pre('save', function(next) {
  if (!this.threatId) {
    this.threatId = `THREAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Static method to get threat statistics
threatSchema.statics.getStatistics = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byType: {
          $push: {
            type: '$type',
            severity: '$severity',
            status: '$status'
          }
        },
        bySeverity: {
          $push: '$severity'
        },
        byStatus: {
          $push: '$status'
        },
        avgRiskScore: { $avg: '$analysis.riskScore' },
        avgConfidence: { $avg: '$analysis.confidence' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || { total: 0, byType: [], bySeverity: [], byStatus: [], avgRiskScore: 0, avgConfidence: 0 };
};

// Static method to get threats by time range
threatSchema.statics.getThreatsByTimeRange = async function(startDate, endDate, filters = {}) {
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    ...filters
  };
  
  return this.find(query).sort({ createdAt: -1 });
};

// Instance method to add investigation note
threatSchema.methods.addNote = function(content, authorId) {
  this.investigation.notes.push({
    content,
    author: authorId,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to assign threat
threatSchema.methods.assignTo = function(userId) {
  this.investigation.assignedTo = userId;
  return this.save();
};

// Instance method to update status
threatSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

// Instance method to add action
threatSchema.methods.addAction = function(actionType, description, executedBy) {
  this.actions.push({
    type: actionType,
    description,
    executedBy,
    executedAt: new Date(),
    status: 'executed'
  });
  return this.save();
};

module.exports = mongoose.model('Threat', threatSchema); 