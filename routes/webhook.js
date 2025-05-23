const express = require('express');
const router = express.Router();
const { getLatestImageInfos } = require('../services/dropbox'); // UPDATED import
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

    const imageInfos = await getLatestImageInfos(2);
    console.log(`Retrieved ${imageInfos.length} image files`);

    const firstName = imageInfos[0].name; // e.g. session_20250523_113156_image_001.jpg
    const sessionMatch = firstName.match(/^(session_\d{8}_\d{6})_image_\d+\.jpg$/);
    const sessionId = sessionMatch ? sessionMatch[1] : `fallback_${Date.now()}`;
    console.log(`Using sessionId: ${sessionId}`);

    const results = await Promise.all(imageInfos.map(async (info) => {
      console.log(`Sending image to Azure Custom Vision: ${info.link}`);
      const predictions = await analyzeImage(info.link);
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
    console.log(`Updated result for ${sessionId} with confidence ${highestConfidence}`);

    if (highestConfidence > 0.55) {
      console.log(`HONEY BADGER DETECTED (confidence: ${highestConfidence})`);
      res.status(200).send('HONEY BADGER DETECTED');
    } else {
      console.log(`No honey badger detected (highest confidence: ${highestConfidence})`);
      res.status(200).send('No honey badger');
    }

    if (imageInfos.length < 2) {
      console.warn(`Expected 2 images but only got ${imageInfos.length}`);
    }

  } catch (err) {
    console.error('Webhook processing error:', err.stack || err.message);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;
