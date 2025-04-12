const express = require('express');
const router = express.Router();
const { getLatestImageUrl } = require('../services/dropbox');
const { analyzeImage } = require('../services/vision');

// ✅ Handle Dropbox webhook verification challenge
router.get('/', (req, res) => {
  const challenge = req.query.challenge;
  if (challenge) {
    console.log('🔁 Responding to Dropbox webhook challenge:', challenge);
    res.status(200).send(challenge);
  } else {
    res.status(400).send('No challenge parameter');
  }
});

// ✅ Handle Dropbox webhook POSTs
router.post('/', async (req, res) => {
  console.log('📦 Received Dropbox Webhook Payload:', JSON.stringify(req.body, null, 2));

  try {
    const userId = req.body?.list_folder?.accounts?.[0];
    if (!userId) {
      console.log('📡 Dropbox webhook verification ping received');
      return res.sendStatus(200);
    }

    const imageUrl = await getLatestImageUrl();
    console.log('🖼️ Analyzing Image URL:', imageUrl);

    const tags = await analyzeImage(imageUrl);
    console.log('🔍 Detected Tags:', tags);

    const found = tags.includes('honey badger');
    if (found) {
      console.log('🐾 Honey badger detected!');
    } else {
      console.log('🚫 No honey badger detected');
    }

    res.status(200).send(found ? 'Honey badger detected' : 'No honey badger');
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(500).send('Error processing image');
  }
});

module.exports = router;
