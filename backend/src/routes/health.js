const express = require('express');
const router = express.Router();

// Vitals summary/history stubs
router.get('/vitals/history', async (req, res) => {
  res.json({ items: [], range: req.query.range || '7d' });
});

router.post('/vitals/summary', async (req, res) => {
  const { heartRate, hrv, spo2, capturedAt } = req.body || {};
  res.json({
    saved: true,
    summary: { heartRate, hrv, spo2, capturedAt: capturedAt || new Date().toISOString() }
  });
});

module.exports = router;

