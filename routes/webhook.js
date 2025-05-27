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

    const maxAttempts = 3;
    const delayMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let imageInfos = await getLatestImageInfos(10); // Get more in case of delay
      imageInfos = imageInfos.sort((a, b) => a.name.localeCompare(b.name));

      // Group by session ID
      const sessionMap = {};
      for (const info of imageInfos) {
        const match = info.name.match(/^(session_\d{8}_\d{6})_image_\d+\.jpg$/);
        if (!match) continue;
        const sessionId = match[1];
        if (!sessionMap[sessionId]) sessionMap[sessionId] = [];
        sessionMap[sessionId].push(info);
      }

      // Pick the most recent unprocessed session
      const sessionIds = Object.keys(sessionMap).sort().reverse(); // newest first
      for (const sessionId of sessionIds) {
        if (processedSessions.has(sessionId)) {
          console.log(`Session ${sessionId} already processed.`);
          continue;
        }

        const images = sessionMap[sessionId];
        processedSessions.add(sessionId);

        const results = await Promise.all(images.map(info => analyzeImage(info.link)));

        let highestConfidence = 0;
        for (const predictions of results) {
          const honeyBadger = predictions.find(p =>
            p?.tagName?.toLowerCase?.() === 'honey badger'
          );
          if (honeyBadger && honeyBadger.probability > highestConfidence) {
            highestConfidence = honeyBadger.probability;
            console.log(`Best confidence came from image with score: ${honeyBadger.probability}`);
          }
        }

        updateResult(sessionId, highestConfidence);
        console.log(`Updated result for ${sessionId} with confidence ${highestConfidence}`);

        if (highestConfidence > 0.55) {
          console.log(`HONEY BADGER DETECTED (confidence: ${highestConfidence})`);
          return res.status(200).send('HONEY BADGER DETECTED');
        } else {
          console.log(`No honey badger detected (confidence: ${highestConfidence})`);
          return res.status(200).send('No honey badger');
        }
      }

      console.log(`No new sessions found. Waiting (${attempt + 1}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    res.status(200).send('No new sessions detected after polling');

  } catch (err) {
    console.error('Webhook processing error:', err.stack || err.message);
    res.status(500).send('Error processing webhook');
  }
});

module.exports = router;
