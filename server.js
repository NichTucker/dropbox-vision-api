const express = require('express');
const bodyParser = require('body-parser');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Handle Dropbox webhook verification
app.get('/', (req, res) => {
  const challenge = req.query.challenge;
  if (challenge) {
    return res.status(200).send(challenge);
  }
  res.status(400).send('No challenge parameter');
});

// Routes
app.use('/webhook', webhookRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
