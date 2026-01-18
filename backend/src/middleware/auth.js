const admin = require('../config/firebase');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Set Firebase User

    // Optional: Sync with Local MongoDB User
    // This finds the user in MongoDB by email matching the Firebase email
    // If you strictly need MongoDB ID for relations, you should find/create here.
    const user = await User.findOne({ email: decodedToken.email });
    if (user) {
      req.user.dbId = user._id; // Attach DB ID for legacy controllers
      req.user.id = user._id;   // Normalize ID
    }

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { authenticateToken };