const express = require('express');
const router = express.Router();

const results = {}; // sessionId => { confidence, timestamp }

function updateResult(sessionId, confidence) {
  results[sessionId] = {
    confidence,
    timestamp: Date.now()
  };
}

router.get('/', (req, res) => {
  const session = req.query.session;
  if (session && results[session]) {
    res.json(results[session]);
  } else {
    res.json({ confidence: 0, timestamp: 0 });
  }
});

module.exports = { router, updateResult };
