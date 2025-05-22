const express = require('express');
const bodyParser = require('body-parser');
const webhookRoute = require('./routes/webhook');
const resultRoute = require('./routes/result').router;

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// Routes
app.use('/webhook', webhookRoute);
app.use('/result', resultRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('     ==> Your service is live 🎉');
});
