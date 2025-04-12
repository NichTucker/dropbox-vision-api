const axios = require('axios');

// Replace with your actual values
const predictionKey = '6ULvMjNoIIw6nJM3cOjC3FNdMPHeh61oL3vilUjpvHQ3hnXdTUeaJQQJ99BDAC5RqLJXJ3w3AAAIACOGIdjO';
const endpoint = 'https://detecthoneybadger-prediction.cognitiveservices.azure.com/';
const projectId = 'f3e284f8-777c-434d-a31d-284ca6646296';
const iterationName = 'Iteration1'; // Update if you renamed it

const analyzeImage = async (imageUrl) => {
  const url = `${endpoint}customvision/v3.0/Prediction/${projectId}/classify/iterations/${iterationName}/url`;

  try {
    const response = await axios.post(
      url,
      { Url: imageUrl },
      {
        headers: {
          'Prediction-Key': predictionKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const predictions = response.data.predictions || [];
    const tags = predictions.map(p => p.tagName.toLowerCase());

    console.log('🧠 Azure returned tags:', tags);
    return tags;
  } catch (err) {
    console.error('❌ Azure Vision error:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { analyzeImage };
