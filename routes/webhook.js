const express = require('express');
const router = express.Router();
const { getLatestImageUrls } = require('../services/dropbox');
const { analyzeImage } = require('../services/vision');
const { updateResult } = require('./result');

// Webhook verification (GET)
router.get('/', (req, res) => {
  const challenge = req.query.challenge;
  if (challenge) {
    console.log('Responding to Dropbox webhook challenge:', challenge);
    res.status(200).send(challenge);
  } else {
    res.status(400).send('No challenge parameter');
  }
});

// Webhook handler (POST)
router.post('/', async (req, res) => {
  console.log('Received Dropbox Webhook Payload:', JSON.stringify(req.body, null, 2));

  try {
    const userId = req.body?.list_folder?.accounts?.[0];
    if (!userId) {
      console.log('Dropbox webhook verification ping received (no userId)');
      return res.sendStatus(200);
    }

    console.log(`Dropbox userId from webhook: ${userId}`);

    const imageUrls = await getLatestImageUrls(2);
    console.log(`Retrieved ${imageUrls.length} image URLs`);

    const sessionMatch = imageUrls[0].match(/\/([^/]+)_image/);
    const sessionId = sessionMatch ? sessionMatch[1] : `fallback_${Date.now()}`;
    console.log(`Using sessionId: ${sessionId}`);

    const results = await Promise.all(imageUrls.map(async (url) => {
      console.log(`Sending image to Azure Custom Vision: ${url}`);
      const predictions = await analyzeImage(url);
      console.log('Full Azure response:', JSON.stringify(predictions, null, 2));
      return predictions;
    }));

    let highestConfidence = 0;

    for (const predictions of results) {
      const honeyBadger = predictions.find(p =>
        p?.tagName?.toLowerCase?.() === 'honey badger'
      );
      if (honeyBadger && honeyBadger.probability > highestConfidence) {
        highestConfidence = honeyBadger.probability;
      }
    }

    updateResult(sessionId, highestConfidence);

    if (highestConfidence > 0.55) {
      console.log(`HONEY BADGER DETECTED (confidence: ${highestConfidence})`);
      res.status(200).send('HONEY BADGER DETECTED');
    } else {
      console.log(`No honey badger detected (highest confidence: ${highestConfidence})`);
      res.status(200).send('No honey badger');
    }

    if (imageUrls.length < 2) {
      console.warn(`Expected 2 images but only got ${imageUrls.length}`);
    }

  } catch (err) {
    console.error('Webhook processing error:', err.stack || err.message);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;
