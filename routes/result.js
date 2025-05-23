const express = require('express');
const router = express.Router();

const results = {}; // Stores results per sessionId

function updateResult(sessionId, confidence) {
  results[sessionId] = {
    confidence,
    timestamp: Date.now()
  };
  console.log(`Stored result for session '${sessionId}'`);
}

router.get('/', (req, res) => {
  const sessionId = req.query.session;
  if (!sessionId || !results[sessionId]) {
    return res.status(404).json({ error: 'Result not found for this session' });
  }
  res.json(results[sessionId]);
});

module.exports = { router, updateResult };
