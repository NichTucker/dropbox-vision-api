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
  
      // Try to get the image URL from Dropbox
      const imageUrl = await getLatestImageUrl();
      console.log('🖼️ Retrieved Dropbox image URL:', imageUrl);
  
      // Analyzing the image
      const tags = await analyzeImage(imageUrl);
      console.log('🔍 Azure Vision detected tags:', tags);
  
      const found = tags.includes('honey badger');
      console.log(found ? '🐾 Honey badger detected!' : '🚫 No honey badger detected');
  
      res.status(200).send(found ? 'Honey badger detected' : 'No honey badger');
    } catch (err) {
      console.error('❌ Webhook processing error:', err.stack || err.message);
      res.status(500).send('Error processing webhook');
    }
  });
  

module.exports = router;