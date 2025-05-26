const express = require('express');
const router = express.Router();
const { getLatestImageInfos } = require('../services/dropbox');
const { analyzeImage } = require('../services/vision');
const { updateResult } = require('./result');

const processedSessions = new Set();

router.get('/', (req, res) => {
  const challenge = req.query.challenge;
  if (challenge) {
    console.log('Responding to Dropbox webhook challenge:', challenge);
    res.status(200).send(challenge);
  } else {
    res.status(400).send('No challenge parameter');
  }
});

router.post('/', async (req, res) => {
  console.log('Received Dropbox Webhook Payload:', JSON.stringify(req.body, null, 2));

  try {
    const userId = req.body?.list_folder?.accounts?.[0];
    if (!userId) {
      console.log('Dropbox webhook verification ping received (no userId)');
      return res.sendStatus(200);
    }

    console.log(`Dropbox userId from webhook: ${userId}`);

<<<<<<< HEAD
    const maxAttempts = 3;
    const delayMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
=======
    let attempts = 0;
    const maxAttempts = 30;
    const delayMs = 500;

    while (attempts < maxAttempts) {
>>>>>>> c0b4e3b7374140a471ab291b6e5795e7a9b24e5c
      const imageInfos = await getLatestImageInfos(2);
      const firstName = imageInfos[0].name;
      const sessionMatch = firstName.match(/^(session_\d{8}_\d{6})_image_\d+\.jpg$/);
      const sessionId = sessionMatch ? sessionMatch[1] : `fallback_${Date.now()}`;

      if (!processedSessions.has(sessionId)) {
        processedSessions.add(sessionId);

        const results = await Promise.all(imageInfos.map(info => analyzeImage(info.link)));

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
        return;
      }

<<<<<<< HEAD
      console.log(`Session ${sessionId} already processed. Attempt ${attempt + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
=======
      console.log(`Session ${sessionId} already processed. Polling again shortly...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      attempts++;
>>>>>>> c0b4e3b7374140a471ab291b6e5795e7a9b24e5c
    }

    res.status(200).send('No new images found after polling');

  } catch (err) {
    console.error('Webhook processing error:', err.stack || err.message);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;