const mongoose = require('mongoose');

const healthScreeningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },

  // Screening Type
  screeningType: {
    type: String,
    enum: ['vital_signs', 'eye_screening', 'voice_analysis', 'symptom_check', 'disease_prediction', 'comprehensive'],
    required: [true, 'Screening type is required']
  },

  // Session Information
  sessionId: {
    type: String,
    unique: true,
    required: true
  },

  // Vital Signs Data (rPPG)
  vitalSigns: {
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' },
      confidence: { type: Number, min: 0, max: 1 },
      quality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
    },
    respiratoryRate: {
      value: Number,
      unit: { type: String, default: 'bpm' },
      confidence: { type: Number, min: 0, max: 1 }
    },
    oxygenSaturation: {
      value: Number,
      unit: { type: String, default: '%' },
      confidence: { type: Number, min: 0, max: 1 }
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: { type: String, default: 'mmHg' },
      confidence: { type: Number, min: 0, max: 1 }
    },
    stressLevel: {
      value: Number, // 0-100
      level: { type: String, enum: ['low', 'medium', 'high'] },
      confidence: { type: Number, min: 0, max: 1 }
    },
    heartRateVariability: {
      rmssd: Number,
      sdnn: Number,
      pnn50: Number
    }
  },

  // Eye Screening Data
  eyeScreening: {
    anemiaRisk: {
      probability: { type: Number, min: 0, max: 1 },
      riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
      confidence: { type: Number, min: 0, max: 1 }
    },
    jaundiceRisk: {
      probability: { type: Number, min: 0, max: 1 },
      riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
      confidence: { type: Number, min: 0, max: 1 }
    },
    colorAnalysis: {
      averageRGB: {
        r: { type: Number, min: 0, max: 255 },
        g: { type: Number, min: 0, max: 255 },
        b: { type: Number, min: 0, max: 255 }
      },
      redRatio: Number,
      yellowIndex: Number,
      palenessIndex: Number,
      scleralIcterusIndex: Number
    },
    imageMetadata: {
      resolution: String,
      lighting: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
      eyeDetectionConfidence: Number
    }
  },

  // Voice Analysis Data
  voiceAnalysis: {
    respiratoryHealth: {
      breathingPattern: { type: String, enum: ['normal', 'irregular', 'labored'] },
      respiratoryRate: Number,
      wheezingDetected: Boolean,
      coughDetected: Boolean,
      confidence: { type: Number, min: 0, max: 1 }
    },
    vocalBiomarkers: {
      pitch: {
        fundamental: Number,
        variance: Number,
        jitter: Number
      },
      intensity: {
        average: Number,
        variance: Number,
        shimmer: Number
      },
      speechRate: Number,
      pausePatterns: {
        totalPauses: Number,
        averagePauseLength: Number,
        breathPauses: Number
      }
    },
    stressIndicators: {
      stressLevel: { type: String, enum: ['low', 'medium', 'high'] },
      emotionalState: { type: String, enum: ['calm', 'anxious', 'stressed', 'excited'] },
      fatigueLevel: { type: String, enum: ['low', 'medium', 'high'] },
      confidence: { type: Number, min: 0, max: 1 }
    },
    audioMetadata: {
      duration: Number, // in seconds
      sampleRate: Number,
      quality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
      noiseLevel: Number
    }
  },

  // Symptom Check Data
  symptomCheck: {
    symptoms: [{
      name: String,
      severity: { type: Number, min: 1, max: 5 },
      duration: String,
      category: { type: String, enum: ['general', 'neurological', 'cardiac', 'respiratory', 'gastrointestinal', 'musculoskeletal', 'dermatological', 'ophthalmological', 'ENT'] }
    }],
    additionalInfo: String,
    urgencyLevel: {
      level: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      score: { type: Number, min: 0, max: 100 },
      recommendations: [String]
    },
    possibleConditions: [{
      condition: String,
      probability: { type: Number, min: 0, max: 1 },
      description: String,
      icd10Code: String
    }]
  },

  // Disease Prediction Data
  diseasePrediction: {
    inputFeatures: [{
      feature: String,
      value: mongoose.Schema.Types.Mixed,
      normalized: Number
    }],
    predictions: [{
      disease: String,
      probability: { type: Number, min: 0, max: 1 },
      riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
      confidence: { type: Number, min: 0, max: 1 },
      icd10Code: String
    }],
    riskFactors: [{
      factor: String,
      impact: { type: String, enum: ['low', 'medium', 'high'] },
      modifiable: Boolean
    }]
  },

  // AI Model Information
  aiModelInfo: {
    modelVersion: String,
    modelType: String,
    processingTime: Number, // milliseconds
    computeResources: {
      cpu: Boolean,
      gpu: Boolean,
      memory: Number // MB
    }
  },

  // Results and Recommendations
  overallAssessment: {
    healthScore: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    recommendations: [{
      category: { type: String, enum: ['lifestyle', 'medical', 'emergency', 'follow-up'] },
      recommendation: String,
      priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      timeframe: String
    }],
    followUpRequired: Boolean,
    emergencyAlert: Boolean
  },

  // Quality and Metadata
  dataQuality: {
    overallScore: { type: Number, min: 0, max: 1 },
    factors: [{
      factor: String,
      score: { type: Number, min: 0, max: 1 },
      impact: String
    }]
  },

  deviceInfo: {
    userAgent: String,
    platform: String,
    cameraResolution: String,
    microphoneQuality: String,
    networkQuality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
  },

  // Status and Workflow
  status: {
    type: String,
    enum: ['initiated', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'initiated'
  },

  processingStages: [{
    stage: String,
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'] },
    startTime: Date,
    endTime: Date,
    errorMessage: String
  }],

  // Review and Validation
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Healthcare professional
  },
  reviewDate: Date,
  reviewNotes: String,
  validated: { type: Boolean, default: false },

  // Export and Sharing
  exported: { type: Boolean, default: false },
  exportedAt: Date,
  sharedWith: [{
    recipientType: { type: String, enum: ['doctor', 'family', 'emergency'] },
    recipientId: String,
    sharedAt: Date,
    permissions: [String]
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
healthScreeningSchema.index({ userId: 1, createdAt: -1 });
healthScreeningSchema.index({ screeningType: 1 });
healthScreeningSchema.index({ sessionId: 1 });
healthScreeningSchema.index({ status: 1 });
healthScreeningSchema.index({ 'overallAssessment.emergencyAlert': 1 });

// Virtual for screening duration
healthScreeningSchema.virtual('duration').get(function() {
  if (!this.updatedAt || !this.createdAt) return null;
  return this.updatedAt - this.createdAt; // milliseconds
});

// Pre-save middleware to generate session ID
healthScreeningSchema.pre('save', function(next) {
  if (!this.sessionId) {
    this.sessionId = `${this.screeningType}_${this.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Static method to get user's screening history
healthScreeningSchema.statics.getUserHistory = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'personalInfo.firstName personalInfo.lastName email');
};

// Static method to get screening statistics
healthScreeningSchema.statics.getScreeningStats = function(userId, fromDate, toDate) {
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
        _id: '$screeningType',
        count: { $sum: 1 },
        avgHealthScore: { $avg: '$overallAssessment.healthScore' },
        latestScreening: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to find emergency cases
healthScreeningSchema.statics.findEmergencyCases = function(limit = 50) {
  return this.find({ 'overallAssessment.emergencyAlert': true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'personalInfo.firstName personalInfo.lastName email emergencyContacts');
};

// Instance method to get risk summary
healthScreeningSchema.methods.getRiskSummary = function() {
  const risks = [];
  
  // Check vital signs risks
  if (this.vitalSigns) {
    if (this.vitalSigns.heartRate?.value > 100 || this.vitalSigns.heartRate?.value < 60) {
      risks.push({ type: 'cardiac', level: 'medium', description: 'Abnormal heart rate detected' });
    }
    if (this.vitalSigns.stressLevel?.level === 'high') {
      risks.push({ type: 'stress', level: 'medium', description: 'High stress level detected' });
    }
  }
  
  // Check eye screening risks
  if (this.eyeScreening) {
    if (this.eyeScreening.anemiaRisk?.riskLevel === 'high') {
      risks.push({ type: 'anemia', level: 'high', description: 'High anemia risk detected' });
    }
    if (this.eyeScreening.jaundiceRisk?.riskLevel === 'high') {
      risks.push({ type: 'jaundice', level: 'high', description: 'High jaundice risk detected' });
    }
  }
  
  return risks;
};

module.exports = mongoose.model('HealthScreening', healthScreeningSchema);