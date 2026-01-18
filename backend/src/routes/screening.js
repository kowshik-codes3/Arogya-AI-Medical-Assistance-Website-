const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|wav|mp3/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
    }
  }
});

// Vital Signs Screening
router.post('/vital-signs',
  authenticateToken,
  upload.single('video'),
  [
    body('duration').optional().isNumeric().withMessage('Duration must be a number'),
    body('quality').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid quality value'),
  ],
  screeningController.processVitalSigns
);

// Get vital signs history
router.get('/vital-signs', authenticateToken, screeningController.getVitalSignsHistory);

// Eye Screening
router.post('/eye-screening',
  authenticateToken,
  upload.single('image'),
  [
    body('eyeRegion').optional().isObject().withMessage('Eye region must be an object'),
  ],
  screeningController.processEyeScreening
);

// Get eye screening history
router.get('/eye-screening', authenticateToken, screeningController.getEyeScreeningHistory);

// Voice Analysis
router.post('/voice-analysis',
  authenticateToken,
  upload.single('audio'),
  [
    body('duration').optional().isNumeric().withMessage('Duration must be a number'),
    body('sampleRate').optional().isNumeric().withMessage('Sample rate must be a number'),
  ],
  screeningController.processVoiceAnalysis
);

// Get voice analysis history
router.get('/voice-analysis', authenticateToken, screeningController.getVoiceAnalysisHistory);

// Disease Prediction
router.post('/disease-prediction',
  authenticateToken,
  [
    body('symptoms').isArray().withMessage('Symptoms must be an array'),
    body('symptoms.*.name').trim().isLength({ min: 1 }).withMessage('Symptom name is required'),
    body('symptoms.*.severity').isInt({ min: 1, max: 5 }).withMessage('Severity must be between 1 and 5'),
    body('duration').optional().trim().isLength({ min: 1 }).withMessage('Duration is required'),
    body('additionalInfo').optional().trim(),
  ],
  screeningController.processDiseasePrediction
);

// Get disease prediction history
router.get('/disease-prediction', authenticateToken, screeningController.getDiseasePredictionHistory);

// Symptom Assessment
router.post('/symptom-assessment',
  authenticateToken,
  [
    body('symptoms').isArray().withMessage('Symptoms must be an array'),
    body('symptoms.*.name').trim().isLength({ min: 1 }).withMessage('Symptom name is required'),
    body('symptoms.*.severity').isInt({ min: 1, max: 5 }).withMessage('Severity must be between 1 and 5'),
    body('symptoms.*.category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  ],
  screeningController.processSymptomAssessment
);

// Get all screening history for a user
router.get('/history', authenticateToken, screeningController.getAllScreeningHistory);

// Get screening summary/statistics
router.get('/summary', authenticateToken, screeningController.getScreeningSummary);

// Delete screening record
router.delete('/:screeningId', authenticateToken, screeningController.deleteScreening);

module.exports = router;