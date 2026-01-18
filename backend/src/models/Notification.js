const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Notification Type and Category
  type: {
    type: String,
    enum: [
      'health_alert', 'screening_reminder', 'result_ready', 'emergency_alert',
      'medication_reminder', 'appointment_reminder', 'goal_progress',
      'system_update', 'security_alert', 'data_export_ready'
    ],
    required: [true, 'Notification type is required']
  },

  category: {
    type: String,
    enum: ['health', 'security', 'system', 'emergency', 'reminder', 'social'],
    required: [true, 'Category is required']
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Content
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },

  // Rich content support
  content: {
    html: String, // Rich HTML content
    markdown: String, // Markdown formatted content
    attachments: [{
      type: { type: String, enum: ['image', 'document', 'link'] },
      url: String,
      title: String,
      description: String
    }],
    actionButtons: [{
      label: String,
      action: String, // URL or action identifier
      style: { type: String, enum: ['primary', 'secondary', 'danger'], default: 'secondary' }
    }]
  },

  // Related Data
  relatedData: {
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthScreening'
    },
    emergencyAlertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyAlert'
    },
    healthGoalId: String,
    appointmentId: String,
    medicationId: String
  },

  // Delivery Methods and Status
  delivery: {
    methods: [{
      type: { type: String, enum: ['push', 'email', 'sms', 'in_app'], required: true },
      status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'], default: 'pending' },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String,
      retryCount: { type: Number, default: 0 },
      maxRetries: { type: Number, default: 3 }
    }]
  },

  // User Interaction
  interaction: {
    read: { type: Boolean, default: false },
    readAt: Date,
    clicked: { type: Boolean, default: false },
    clickedAt: Date,
    dismissed: { type: Boolean, default: false },
    dismissedAt: Date,
    actionTaken: String, // Which action button was clicked
    actionTakenAt: Date
  },

  // Scheduling
  scheduling: {
    scheduledFor: Date, // When to send the notification
    timezone: String,
    recurring: {
      enabled: { type: Boolean, default: false },
      pattern: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'] },
      customPattern: String, // Cron expression for custom patterns
      endDate: Date,
      nextOccurrence: Date
    }
  },

  // Personalization
  personalization: {
    template: String, // Template identifier
    variables: mongoose.Schema.Types.Mixed, // Template variables
    localization: {
      language: { type: String, default: 'en' },
      region: String
    }
  },

  // Targeting and Segmentation
  targeting: {
    userSegment: String,
    conditions: [{
      field: String,
      operator: String, // eq, ne, gt, lt, in, etc.
      value: mongoose.Schema.Types.Mixed
    }],
    excludeUserIds: [mongoose.Schema.Types.ObjectId]
  },

  // Analytics and Tracking
  analytics: {
    campaignId: String,
    source: String, // Where the notification was triggered from
    tags: [String],
    customProperties: mongoose.Schema.Types.Mixed
  },

  // Expiration and Lifecycle
  lifecycle: {
    expiresAt: Date,
    autoExpire: { type: Boolean, default: false },
    maxAge: Number, // Hours after which notification expires
    archived: { type: Boolean, default: false },
    archivedAt: Date
  },

  // System metadata
  createdBy: {
    type: String,
    enum: ['system', 'admin', 'ai_service', 'emergency_service', 'user'],
    default: 'system'
  },

  metadata: {
    source: String,
    version: String,
    context: mongoose.Schema.Types.Mixed
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, 'interaction.read': 1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ priority: 1, 'scheduling.scheduledFor': 1 });
notificationSchema.index({ 'lifecycle.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Virtual for display time (considers timezone)
notificationSchema.virtual('displayTime').get(function() {
  const targetTime = this.scheduling?.scheduledFor || this.createdAt;
  if (this.scheduling?.timezone) {
    // In a real application, you'd use a timezone library like moment-timezone
    return targetTime;
  }
  return targetTime;
});

// Virtual for notification age in hours
notificationSchema.virtual('ageInHours').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual to check if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  if (this.lifecycle?.expiresAt) {
    return new Date() > this.lifecycle.expiresAt;
  }
  if (this.lifecycle?.maxAge) {
    return this.ageInHours > this.lifecycle.maxAge;
  }
  return false;
});

// Pre-save middleware to set expiration
notificationSchema.pre('save', function(next) {
  if (this.lifecycle?.maxAge && !this.lifecycle?.expiresAt) {
    this.lifecycle.expiresAt = new Date(this.createdAt.getTime() + (this.lifecycle.maxAge * 60 * 60 * 1000));
  }
  next();
});

// Pre-save middleware to set next occurrence for recurring notifications
notificationSchema.pre('save', function(next) {
  if (this.scheduling?.recurring?.enabled && !this.scheduling?.recurring?.nextOccurrence) {
    // Calculate next occurrence based on pattern
    const now = new Date();
    switch (this.scheduling.recurring.pattern) {
      case 'daily':
        this.scheduling.recurring.nextOccurrence = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        this.scheduling.recurring.nextOccurrence = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        this.scheduling.recurring.nextOccurrence = new Date(now.setMonth(now.getMonth() + 1));
        break;
    }
  }
  next();
});

// Static method to get unread notifications for user
notificationSchema.statics.getUnreadForUser = function(userId, limit = 20) {
  return this.find({
    userId,
    'interaction.read': false,
    'lifecycle.archived': false,
    $or: [
      { 'lifecycle.expiresAt': { $exists: false } },
      { 'lifecycle.expiresAt': { $gt: new Date() } }
    ]
  })
  .sort({ priority: 1, createdAt: -1 }) // Critical first, then by newest
  .limit(limit);
};

// Static method to get notification statistics
notificationSchema.statics.getNotificationStats = function(userId, fromDate, toDate) {
  const match = { userId };
  if (fromDate || toDate) {
    match.createdAt = {};
    if (fromDate) match.createdAt.$gte = new Date(fromDate);
    if (toDate) match.createdAt.$lte = new Date(toDate);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          type: '$type',
          priority: '$priority'
        },
        count: { $sum: 1 },
        readCount: {
          $sum: { $cond: ['$interaction.read', 1, 0] }
        },
        clickCount: {
          $sum: { $cond: ['$interaction.clicked', 1, 0] }
        }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        total: { $sum: '$count' },
        readRate: {
          $avg: { $divide: ['$readCount', '$count'] }
        },
        clickRate: {
          $avg: { $divide: ['$clickCount', '$count'] }
        },
        priorities: {
          $push: {
            priority: '$_id.priority',
            count: '$count'
          }
        }
      }
    }
  ]);
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function(userId, notificationIds) {
  return this.updateMany(
    {
      userId,
      _id: { $in: notificationIds },
      'interaction.read': false
    },
    {
      $set: {
        'interaction.read': true,
        'interaction.readAt': new Date()
      }
    }
  );
};

// Instance method to mark as interacted
notificationSchema.methods.markAsInteracted = function(action) {
  this.interaction.clicked = true;
  this.interaction.clickedAt = new Date();
  if (action) {
    this.interaction.actionTaken = action;
    this.interaction.actionTakenAt = new Date();
  }
  return this.save();
};

// Instance method to check if should be delivered
notificationSchema.methods.shouldDeliver = function() {
  // Check if expired
  if (this.isExpired) return false;
  
  // Check if scheduled for future
  if (this.scheduling?.scheduledFor && this.scheduling.scheduledFor > new Date()) {
    return false;
  }
  
  // Check if already delivered successfully
  const hasSuccessfulDelivery = this.delivery?.methods?.some(
    method => method.status === 'delivered'
  );
  
  return !hasSuccessfulDelivery;
};

// Instance method to get delivery summary
notificationSchema.methods.getDeliveryStatus = function() {
  if (!this.delivery?.methods?.length) {
    return { status: 'not_sent', summary: 'No delivery methods configured' };
  }
  
  const methods = this.delivery.methods;
  const delivered = methods.filter(m => m.status === 'delivered').length;
  const failed = methods.filter(m => m.status === 'failed').length;
  const pending = methods.filter(m => m.status === 'pending').length;
  
  if (delivered > 0) {
    return { status: 'delivered', summary: `Delivered via ${delivered} method(s)` };
  } else if (failed === methods.length) {
    return { status: 'failed', summary: 'All delivery methods failed' };
  } else if (pending > 0) {
    return { status: 'pending', summary: `${pending} method(s) pending` };
  } else {
    return { status: 'sent', summary: 'Sent but delivery status unknown' };
  }
};

module.exports = mongoose.model('Notification', notificationSchema);