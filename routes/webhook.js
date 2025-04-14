const express = require('express');
const router = express.Router();
const { getLatestImageUrl } = require('../services/dropbox');
const { analyzeImage } = require('../services/vision');

// Webhook verification (GET)
router.get('/', (req, res) => {
  const challenge = req.query.challenge;
  if (challenge) {
    console.log('🔁 Responding to Dropbox webhook challenge:', challenge);
    res.status(200).send(challenge);
  } else {
    res.status(400).send('No challenge parameter');
  }
});

// Webhook handler (POST)
router.post('/', async (req, res) => {
  console.log('📦 Received Dropbox Webhook Payload:', JSON.stringify(req.body, null, 2));

  try {
    const userId = req.body?.list_folder?.accounts?.[0];
    if (!userId) {
      console.log('📡 Dropbox webhook verification ping received (no userId)');
      return res.sendStatus(200);
    }

    console.log(`👤 Dropbox userId from webhook: ${userId}`);

    const imageUrl = await getLatestImageUrl();
    console.log('🖼️ Retrieved Dropbox image URL:', imageUrl);

    const predictions = await analyzeImage(imageUrl);

    const honeyBadger = predictions.find(p => 
      p?.tagName?.toLowerCase?.() === 'honey badger'
    );
    const confidence = honeyBadger?.probability ?? 0;

    if (honeyBadger && confidence > 0.8) {
      console.log(`🐾 HONEY BADGER DETECTED (confidence: ${confidence})`);
      res.status(200).send('HONEY BADGER DETECTED');
    } else {
      console.log(`🚫 No honey badger detected (confidence: ${confidence})`);
      res.status(200).send('No honey badger');
    }
  } catch (err) {
    console.error('❌ Webhook processing error:', err.stack || err.message);
    res.status(500).send('Error processing webhook');
  }
});
  

module.exports = router;
