const EyeScan = require('../models/EyeScan');
const VitalScan = require('../models/VitalScan');
// const VoiceScan = require('../models/VoiceScan'); // Future
const HealthScreening = require('../models/HealthScreening');

module.exports = {
  // Process and Save Vital Signs (rPPG)
  processVitalSigns: async (req, res) => {
    try {
      const { heartRate, respiratoryRate, oxygenSaturation, bloodPressure, stressLevel, sessionId, videoUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Create new VitalScan entry in separate collection
      const vitalScan = new VitalScan({
        userId,
        sessionId: sessionId || `vital_${Date.now()}`,
        videoUrl, // Storing video reference if provided
        heartRate,
        respiratoryRate,
        oxygenSaturation,
        bloodPressure,
        stressLevel,
        status: 'completed'
      });

      await vitalScan.save();

      res.json({
        success: true,
        message: 'Vital signs saved to vital_scans collection',
        data: vitalScan
      });
    } catch (error) {
      console.error('Error saving vital signs:', error);
      res.status(500).json({ error: 'Failed to save vital signs' });
    }
  },

  // Process and Save Eye Screening
  processEyeScreening: async (req, res) => {
    try {
      const { anemiaRisk, jaundiceRisk, colorAnalysis, metadata, sessionId, mediaUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Create new EyeScan entry in separate collection
      const eyeScan = new EyeScan({
        userId,
        sessionId: sessionId || `eye_${Date.now()}`,
        mediaUrl, // Storing image/video reference
        anemiaRisk,
        jaundiceRisk,
        colorAnalysis,
        metadata,
        status: 'completed'
      });

      await eyeScan.save();

      res.json({
        success: true,
        message: 'Eye screening saved to eye_scans collection',
        data: eyeScan
      });
    } catch (error) {
      console.error('Error saving eye screening:', error);
      res.status(500).json({ error: 'Failed to save eye screening' });
    }
  },

  // Get Vital Signs History
  getVitalSignsHistory: async (req, res) => {
    try {
      const history = await VitalScan.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
      res.json({ items: history });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  },

  // Get Eye Screening History
  getEyeScreeningHistory: async (req, res) => {
    try {
      const history = await EyeScan.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
      res.json({ items: history });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  },

  // Stubs for others (maintaining partial compatibility)
  processVoiceAnalysis: async (req, res) => res.json({ status: 'ok', type: 'voice-analysis' }),
  getVoiceAnalysisHistory: async (req, res) => res.json({ items: [] }),
  processDiseasePrediction: async (req, res) => res.json({ predictions: [], confidence: 0.0 }),
  getDiseasePredictionHistory: async (req, res) => res.json({ items: [] }),
  processSymptomAssessment: async (req, res) => res.json({ assessment: [], confidence: 0.0 }),
  getAllScreeningHistory: async (req, res) => res.json({ items: [] }),
  getScreeningSummary: async (req, res) => res.json({ total: 0 }),
  deleteScreening: async (req, res) => res.json({ success: true })
};
