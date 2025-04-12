const axios = require('axios');

// Replace these with your Azure Custom Vision values
const predictionKey = '6ULvMjNoIIw6nJM3cOjC3FNdMPHeh61oL3vilUjpvHQ3hnXdTUeaJQQJ99BDAC5RqLJXJ3w3AAAIACOGIdjO';
const endpoint = 'https://detecthoneybadger-prediction.cognitiveservices.azure.com/';
const projectId = 'f3e284f8-777c-434d-a31d-284ca6646296';
const iterationName = 'Iteration1';

const analyzeImage = async (imageUrl) => {
  const url = `${endpoint}customvision/v3.0/Prediction/${projectId}/classify/iterations/${iterationName}/url`;

  try {
    console.log(`📤 Sending image to Azure Custom Vision: ${imageUrl}`);
    console.log(`🧪 Endpoint: ${url}`);

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

    console.log('🧠 Full Azure response:', JSON.stringify(response.data, null, 2));

    const predictions = response.data.predictions || [];
    const tags = predictions.map(p => p.tagName.toLowerCase());
    return tags;
  } catch (err) {
    console.error('❌ Azure Vision error:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { analyzeImage };
