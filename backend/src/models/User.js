const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: [true, 'Gender is required']
    },
    height: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['cm', 'ft'], default: 'cm' }
    },
    weight: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' }
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
    }
  },

  // Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Medical History
  medicalHistory: {
    conditions: [{
      condition: String,
      diagnosedDate: Date,
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      isActive: { type: Boolean, default: true }
    }],
    allergies: [{
      allergen: String,
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      reaction: String
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      isActive: { type: Boolean, default: true }
    }],
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      complications: String
    }],
    familyHistory: [{
      relation: String,
      condition: String,
      ageAtDiagnosis: Number
    }]
  },

  // Emergency Contacts
  emergencyContacts: [{
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: String,
    isPrimary: { type: Boolean, default: false }
  }],

  // Health Goals
  healthGoals: [{
    goal: { type: String, required: true },
    target: String,
    deadline: Date,
    progress: { type: Number, min: 0, max: 100, default: 0 },
    isActive: { type: Boolean, default: true },
    createdDate: { type: Date, default: Date.now }
  }],

  // User Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      emergencyAlerts: { type: Boolean, default: true }
    },
    privacy: {
      shareDataWithDoctors: { type: Boolean, default: false },
      shareDataForResearch: { type: Boolean, default: false },
      allowEmergencyAccess: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },

  // Health Score and Risk Assessment
  healthMetrics: {
    overallHealthScore: { type: Number, min: 0, max: 100, default: 50 },
    lastCalculated: Date,
    riskFactors: [{
      factor: String,
      riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
      description: String,
      lastAssessed: { type: Date, default: Date.now }
    }]
  },

  // Profile Status
  profileCompleteness: { type: Number, min: 0, max: 100, default: 0 },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  
  // Refresh Token for JWT
  refreshTokens: [String]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for BMI
userSchema.virtual('bmi').get(function() {
  const weight = this.personalInfo.weight?.value;
  const height = this.personalInfo.height?.value;
  
  if (!weight || !height) return null;
  
  // Convert to metric if needed
  let weightKg = weight;
  let heightM = height;
  
  if (this.personalInfo.weight.unit === 'lbs') {
    weightKg = weight * 0.453592;
  }
  
  if (this.personalInfo.height.unit === 'ft') {
    heightM = height * 0.3048;
  } else {
    heightM = height / 100; // cm to m
  }
  
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to calculate profile completeness
userSchema.pre('save', function(next) {
  let completeness = 0;
  const totalFields = 10;
  
  // Check personal info completion
  if (this.personalInfo.firstName) completeness++;
  if (this.personalInfo.lastName) completeness++;
  if (this.personalInfo.dateOfBirth) completeness++;
  if (this.personalInfo.gender) completeness++;
  if (this.personalInfo.height?.value) completeness++;
  if (this.personalInfo.weight?.value) completeness++;
  if (this.emergencyContacts && this.emergencyContacts.length > 0) completeness++;
  if (this.medicalHistory.allergies && this.medicalHistory.allergies.length > 0) completeness++;
  if (this.healthGoals && this.healthGoals.length > 0) completeness++;
  if (this.isEmailVerified) completeness++;
  
  this.profileCompleteness = Math.round((completeness / totalFields) * 100);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate auth token data
userSchema.methods.getAuthTokenData = function() {
  return {
    id: this._id,
    email: this.email,
    fullName: this.fullName,
    isEmailVerified: this.isEmailVerified
  };
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get active users count
userSchema.statics.getActiveUsersCount = function() {
  return this.countDocuments({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);