const express = require('express');
const router = express.Router();

router.post('/trigger', (req, res) => {
  res.json({ success: true });
});

module.exports = router;

