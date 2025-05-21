const axios = require('axios');

let cachedAccessToken = null;
let tokenExpiry = 0;

async function refreshAccessToken() {
  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiry - 60 * 1000) {
    return cachedAccessToken; // reuse if not about to expire
  }

  const res = await axios.post(
    'https://api.dropboxapi.com/oauth2/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
      client_id: process.env.DROPBOX_APP_KEY,
      client_secret: process.env.DROPBOX_APP_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  cachedAccessToken = res.data.access_token;
  tokenExpiry = now + res.data.expires_in * 1000;
  console.log('Refreshed Dropbox access token');
  return cachedAccessToken;
}

async function getLatestImageUrls(count = 6) {
  const accessToken = await refreshAccessToken();

  const listRes = await axios.post(
    'https://api.dropboxapi.com/2/files/list_folder',
    { path: '' },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const entries = listRes.data.entries
    .filter(file => file['.tag'] === 'file' && /\.(jpg|jpeg|png)$/i.test(file.name))
    .sort((a, b) => new Date(b.client_modified) - new Date(a.client_modified));

  const selected = entries.slice(0, count);

  if (!selected.length) throw new Error('No image files found in Dropbox');

  const imageUrls = [];

  for (const file of selected) {
    const linkRes = await axios.post(
      'https://api.dropboxapi.com/2/files/get_temporary_link',
      { path: file.path_lower },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    imageUrls.push(linkRes.data.link);
  }

  return imageUrls;
}

module.exports = { getLatestImageUrls };