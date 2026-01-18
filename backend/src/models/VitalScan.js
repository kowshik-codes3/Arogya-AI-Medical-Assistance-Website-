const mongoose = require('mongoose');

const vitalScanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },

    sessionId: {
        type: String,
        unique: true,
        required: true
    },

    // Storage for the rPPG video file
    videoUrl: {
        type: String,
        required: false
    },

    // Analysis Results
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
    },

    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'completed'
    }
}, {
    timestamps: true,
    collection: 'vital_scans' // Explicit collection name
});

module.exports = mongoose.model('VitalScan', vitalScanSchema);
