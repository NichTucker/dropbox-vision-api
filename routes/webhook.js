const express = require('express');
const router = express.Router();
const { getLatestImageUrl } = require('../services/dropbox');
const { analyzeImage } = require('../services/vision');

router.post('/', async (req, res) => {
  // ✅ Log incoming webhook payload
  console.log('📦 Received Dropbox Webhook Payload:', JSON.stringify(req.body, null, 2));

  try {
    // ✅ Handle Dropbox verification ping
    const userId = req.body?.list_folder?.accounts?.[0];
    if (!userId) {
      console.log('📡 Dropbox webhook verification ping received');
      return res.sendStatus(200);
    }

    // ✅ Get latest image from Dropbox
    const imageUrl = await getLatestImageUrl();
    console.log('🖼️ Analyzing Image URL:', imageUrl);

    // ✅ Analyze the image using Azure Custom Vision
    const tags = await analyzeImage(imageUrl);
    console.log('🔍 Detected Tags:', tags);

    // ✅ Check for honey badger tag
    const found = tags.includes('honey badger');
    if (found) {
      console.log('🐾 Honey badger detected!');
    } else {
      console.log('🚫 No honey badger detected');
    }

    // ✅ Respond with result
    res.status(200).send(found ? 'Honey badger detected' : 'No honey badger');
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(500).send('Error processing image');
  }
});

module.exports = router;
