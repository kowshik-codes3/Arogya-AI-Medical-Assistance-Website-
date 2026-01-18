const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
// 1. Try to find serviceAccountKey.json in project root or src
const keyPath = path.resolve(__dirname, '../../serviceAccountKey.json');

try {
    if (fs.existsSync(keyPath)) {
        const serviceAccount = require(keyPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin Initialized with serviceAccountKey.json');
    } else {
        // 2. Fallback to default (Cloud Functions or Env Var)
        admin.initializeApp();
        console.log('✅ Firebase Admin Initialized (Default Credentials)');
    }
} catch (error) {
    if (!/already exists/.test(error.message)) {
        console.error('Firebase Admin Error:', error.stack);
    }
}

module.exports = admin;
