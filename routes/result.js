const express = require('express');
const router = express.Router();

let lastResult = {
  confidence: 0,
  timestamp: 0
};

function updateResult(confidence) {
  lastResult = {
    confidence,
    timestamp: Date.now()
  };
}

router.get('/', (req, res) => {
  res.json(lastResult);
});

module.exports = { router, updateResult };
