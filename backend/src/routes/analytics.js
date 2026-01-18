const express = require('express');
const router = express.Router();

// PDF report generation stub
router.post('/reports/generate', async (req, res) => {
  const { range } = req.body || {};
  res.json({
    reportId: `rep_${Date.now()}`,
    range: range || '7d',
    status: 'queued'
  });
});

module.exports = router;

