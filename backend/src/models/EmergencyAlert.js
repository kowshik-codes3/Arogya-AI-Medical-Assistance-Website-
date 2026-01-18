const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Emergency Type and Details
  emergencyType: {
    type: String,
    enum: ['cardiac', 'respiratory', 'neurological', 'trauma', 'allergic_reaction', 'unconsciousness', 'severe_pain', 'bleeding', 'poisoning', 'other'],
    required: [true, 'Emergency type is required']
  },

  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Severity level is required'],
    default: 'medium'
  },

  // Location Information
  location: {
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: Number // in meters
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      formattedAddress: String
    },
    locationType: {
      type: String,
      enum: ['home', 'work', 'public', 'vehicle', 'medical_facility', 'other'],
      default: 'other'
    },
    nearestLandmark: String
  },

  // Emergency Description
  description: {
    userReported: String, // What the user or reporter described
    symptoms: [String],
    timeOfOnset: Date,
    consciousness: {
      type: String,
      enum: ['conscious', 'semi_conscious', 'unconscious', 'unknown'],
      default: 'conscious'
    },
    breathing: {
      type: String,
      enum: ['normal', 'difficulty', 'stopped', 'unknown'],
      default: 'normal'
    },
    mobility: {
      type: String,
      enum: ['mobile', 'limited', 'immobile', 'unknown'],
      default: 'mobile'
    }
  },

  // Medical Context
  medicalContext: {
    vitals: {
      heartRate: Number,
      bloodPressure: {
        systolic: Number,
        diastolic: Number
      },
      temperature: Number,
      oxygenSaturation: Number,
      respiratoryRate: Number
    },
    currentMedications: [String],
    knownAllergies: [String],
    relevantMedicalHistory: [String],
    recentHealthScreening: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthScreening'
    }
  },

  // Contact and Response Information
  contactInfo: {
    reportedBy: {
      type: String,
      enum: ['self', 'family', 'friend', 'stranger', 'medical_professional', 'automated_system'],
      required: true
    },
    reporterContact: {
      name: String,
      phoneNumber: String,
      relationship: String
    },
    patientCanSpeak: { type: Boolean, default: true },
    emergencyContactsNotified: [{
      contactId: mongoose.Schema.Types.ObjectId,
      name: String,
      phoneNumber: String,
      notificationMethod: { type: String, enum: ['call', 'sms', 'email'] },
      notifiedAt: Date,
      responseReceived: Boolean,
      responseTime: Date
    }]
  },

  // Emergency Services Response
  emergencyResponse: {
    servicesContacted: [{
      service: { type: String, enum: ['911', 'ambulance', 'fire', 'police', 'poison_control'] },
      contactTime: Date,
      operatorId: String,
      caseNumber: String,
      estimatedArrival: Date,
      actualArrival: Date
    }],
    dispatchInfo: {
      dispatchTime: Date,
      unitAssigned: String,
      priority: { type: String, enum: ['P1', 'P2', 'P3', 'P4'] },
      triage: String
    },
    responseTime: Number, // minutes from alert to arrival
    outcome: {
      type: String,
      enum: ['transported', 'treated_on_scene', 'refused_treatment', 'false_alarm', 'resolved'],
    },
    transportDestination: {
      facilityName: String,
      facilityType: { type: String, enum: ['hospital', 'urgent_care', 'clinic'] },
      estimatedArrival: Date,
      actualArrival: Date
    }
  },

  // AI Assessment
  aiAssessment: {
    riskScore: { type: Number, min: 0, max: 100 },
    recommendedActions: [String],
    urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    similarCases: [String],
    processedAt: Date,
    modelVersion: String,
    confidence: { type: Number, min: 0, max: 1 }
  },

  // Alert Status and Workflow
  status: {
    type: String,
    enum: ['active', 'dispatched', 'responded', 'resolved', 'cancelled', 'false_alarm'],
    default: 'active'
  },

  timeline: [{
    timestamp: Date,
    event: String,
    description: String,
    updatedBy: String
  }],

  // Resolution and Follow-up
  resolution: {
    resolvedAt: Date,
    resolvedBy: String,
    finalOutcome: String,
    hospitalAdmission: {
      admitted: Boolean,
      hospital: String,
      ward: String,
      condition: String
    },
    followUpRequired: Boolean,
    followUpScheduled: Date,
    notes: String
  },

  // Data Quality and Validation
  dataQuality: {
    locationAccuracy: { type: String, enum: ['high', 'medium', 'low'] },
    informationCompleteness: { type: Number, min: 0, max: 100 },
    sourceReliability: { type: String, enum: ['high', 'medium', 'low'] }
  },

  // Privacy and Legal
  consentGiven: { type: Boolean, default: true },
  dataShared: [{
    sharedWith: String,
    purpose: String,
    timestamp: Date,
    consentType: { type: String, enum: ['explicit', 'implied', 'emergency'] }
  }],

  // System Metadata
  alertId: {
    type: String,
    unique: true,
    required: true
  },
  deviceInfo: {
    platform: String,
    userAgent: String,
    networkType: String,
    batteryLevel: Number
  },
  autoGenerated: { type: Boolean, default: false }, // True if generated by AI system
  priority: { type: Number, min: 1, max: 5, default: 3 }, // 1 = highest, 5 = lowest

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for emergency response efficiency
emergencyAlertSchema.index({ userId: 1, status: 1 });
emergencyAlertSchema.index({ alertId: 1 });
emergencyAlertSchema.index({ severity: 1, status: 1 });
emergencyAlertSchema.index({ createdAt: -1 });
emergencyAlertSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for response time calculation
emergencyAlertSchema.virtual('totalResponseTime').get(function() {
  if (!this.emergencyResponse?.responseTime) return null;
  return this.emergencyResponse.responseTime;
});

// Virtual for alert duration
emergencyAlertSchema.virtual('alertDuration').get(function() {
  const endTime = this.resolution?.resolvedAt || new Date();
  return Math.round((endTime - this.createdAt) / (1000 * 60)); // minutes
});

// Pre-save middleware to generate alert ID
emergencyAlertSchema.pre('save', function(next) {
  if (!this.alertId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.alertId = `EMRG-${timestamp}-${random}`;
  }
  next();
});

// Pre-save middleware to add timeline entry
emergencyAlertSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      timestamp: new Date(),
      event: 'status_change',
      description: `Status changed to: ${this.status}`,
      updatedBy: 'system'
    });
  }
  next();
});

// Static method to find nearby emergencies
emergencyAlertSchema.statics.findNearbyEmergencies = function(latitude, longitude, radiusKm = 10) {
  return this.find({
    'location.coordinates': {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    },
    status: { $in: ['active', 'dispatched'] }
  });
};

// Static method to get emergency statistics
emergencyAlertSchema.statics.getEmergencyStats = function(fromDate, toDate) {
  const match = {};
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
          type: '$emergencyType',
          severity: '$severity'
        },
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$emergencyResponse.responseTime' },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        severityBreakdown: {
          $push: {
            severity: '$_id.severity',
            count: '$count',
            avgResponseTime: '$avgResponseTime',
            resolved: '$resolved'
          }
        },
        totalCount: { $sum: '$count' }
      }
    },
    { $sort: { totalCount: -1 } }
  ]);
};

// Instance method to calculate urgency score
emergencyAlertSchema.methods.calculateUrgencyScore = function() {
  let score = 0;
  
  // Base severity score
  const severityScores = { low: 20, medium: 40, high: 70, critical: 100 };
  score += severityScores[this.severity] || 40;
  
  // Emergency type modifiers
  const highRiskTypes = ['cardiac', 'respiratory', 'neurological', 'unconsciousness'];
  if (highRiskTypes.includes(this.emergencyType)) {
    score += 20;
  }
  
  // Consciousness level
  if (this.description.consciousness === 'unconscious') {
    score += 30;
  } else if (this.description.consciousness === 'semi_conscious') {
    score += 15;
  }
  
  // Breathing issues
  if (this.description.breathing === 'stopped') {
    score += 40;
  } else if (this.description.breathing === 'difficulty') {
    score += 20;
  }
  
  // Age factor (if user data available)
  // This would require populating user data
  
  return Math.min(score, 100);
};

// Instance method to get recommended actions
emergencyAlertSchema.methods.getRecommendedActions = function() {
  const actions = [];
  const urgencyScore = this.calculateUrgencyScore();
  
  if (urgencyScore >= 80) {
    actions.push('Call 911 immediately');
    actions.push('Ensure patient airway is clear');
    actions.push('Monitor vital signs continuously');
  } else if (urgencyScore >= 60) {
    actions.push('Seek immediate medical attention');
    actions.push('Contact emergency services if condition worsens');
  } else {
    actions.push('Monitor condition closely');
    actions.push('Contact healthcare provider');
  }
  
  // Type-specific actions
  if (this.emergencyType === 'cardiac') {
    actions.push('Have patient rest in comfortable position');
    actions.push('Give aspirin if not allergic and conscious');
  } else if (this.emergencyType === 'allergic_reaction') {
    actions.push('Administer epinephrine if available');
    actions.push('Remove allergen source');
  }
  
  return actions;
};

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);