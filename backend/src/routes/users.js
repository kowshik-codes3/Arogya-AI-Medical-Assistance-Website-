const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');

// Get user profile
router.get('/profile', authenticateToken, userController.getProfile);

// Update user profile
router.put('/profile', 
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('age').optional().isInt({ min: 1, max: 150 }).withMessage('Age must be between 1 and 150'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('height').optional().trim().isLength({ min: 1 }).withMessage('Height is required'),
    body('weight').optional().trim().isLength({ min: 1 }).withMessage('Weight is required'),
    body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  ],
  userController.updateProfile
);

// Get user health goals
router.get('/health-goals', authenticateToken, userController.getHealthGoals);

// Add health goal
router.post('/health-goals',
  authenticateToken,
  [
    body('goal').trim().isLength({ min: 3 }).withMessage('Goal must be at least 3 characters'),
    body('target').trim().isLength({ min: 1 }).withMessage('Target is required'),
    body('deadline').isISO8601().withMessage('Invalid deadline format'),
  ],
  userController.addHealthGoal
);

// Update health goal
router.put('/health-goals/:goalId',
  authenticateToken,
  [
    body('goal').optional().trim().isLength({ min: 3 }).withMessage('Goal must be at least 3 characters'),
    body('target').optional().trim().isLength({ min: 1 }).withMessage('Target is required'),
    body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  ],
  userController.updateHealthGoal
);

// Delete health goal
router.delete('/health-goals/:goalId', authenticateToken, userController.deleteHealthGoal);

// Get user medical history
router.get('/medical-history', authenticateToken, userController.getMedicalHistory);

// Update medical history
router.put('/medical-history',
  authenticateToken,
  userController.updateMedicalHistory
);

// Get emergency contacts
router.get('/emergency-contacts', authenticateToken, userController.getEmergencyContacts);

// Add emergency contact
router.post('/emergency-contacts',
  authenticateToken,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('relationship').trim().isLength({ min: 1 }).withMessage('Relationship is required'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  ],
  userController.addEmergencyContact
);

// Update emergency contact
router.put('/emergency-contacts/:contactId',
  authenticateToken,
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('relationship').optional().trim().isLength({ min: 1 }).withMessage('Relationship is required'),
    body('phone').optional().trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  ],
  userController.updateEmergencyContact
);

// Delete emergency contact
router.delete('/emergency-contacts/:contactId', authenticateToken, userController.deleteEmergencyContact);

// Get user preferences
router.get('/preferences', authenticateToken, userController.getPreferences);

// Update user preferences
router.put('/preferences',
  authenticateToken,
  userController.updatePreferences
);

// Consent endpoints (stub)
router.get('/consent', authenticateToken, async (req, res) => {
  try {
    // Return a simple consent object for now; integrate with DB later
    res.json({ version: 'v1', accepted: true, acceptedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch consent' });
  }
});

router.put('/consent', authenticateToken, [
  body('version').isString().withMessage('version is required'),
  body('accepted').isBoolean().withMessage('accepted must be boolean')
], async (req, res) => {
  try {
    const { version, accepted } = req.body;
    // Persist to DB in future; echo back for now
    res.json({ version, accepted, updatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update consent' });
  }
});

// Delete user account
router.delete('/account', authenticateToken, userController.deleteAccount);

module.exports = router;