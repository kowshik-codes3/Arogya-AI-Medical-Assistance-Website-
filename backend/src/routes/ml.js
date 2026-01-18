const express = require('express');
const router = express.Router();

router.get('/models', (req, res) => {
  res.json({ models: [] });
});

module.exports = router;

