const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.json({ token: 'stub', refreshToken: 'stub' });
});

router.post('/register', (req, res) => {
  res.json({ success: true });
});

router.post('/refresh', (req, res) => {
  res.json({ token: 'stub' });
});

module.exports = router;

