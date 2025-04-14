const axios = require('axios');

const predictionKey = process.env.AZURE_PREDICTION_KEY;
const endpoint = process.env.AZURE_CUSTOM_VISION_ENDPOINT;
const projectId = process.env.AZURE_CUSTOM_VISION_PROJECT_ID;
const iterationName = process.env.AZURE_CUSTOM_VISION_ITERATION;

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
