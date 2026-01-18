const mongoose = require('mongoose');

const eyeScanSchema = new mongoose.Schema({
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

    // Storage for the raw video/image file if user uploads one
    mediaUrl: {
        type: String,
        required: false
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },

    // Analysis Results
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
    metadata: {
        resolution: String,
        lighting: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
        eyeDetectionConfidence: Number
    },

    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'completed'
    }
}, {
    timestamps: true,
    collection: 'eye_scans' // Explicit collection name
});

module.exports = mongoose.model('EyeScan', eyeScanSchema);
