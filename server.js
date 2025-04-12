const express = require('express');
const bodyParser = require('body-parser');
const webhook = require('./routes/webhook');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Webhook route
app.use('/webhook', webhook);

// Status page
app.get('/', (req, res) => {
  res.send(`
    <h1>🐾 Dropbox + Azure Vision Backend</h1>
    <p>Status: Running</p>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
