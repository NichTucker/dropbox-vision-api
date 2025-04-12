const axios = require('axios');

const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

async function getLatestImageUrl() {
  const listRes = await axios.post(
    'https://api.dropboxapi.com/2/files/list_folder',
    { path: '' }, // you can set a folder path if needed
    {
      headers: {
        Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const entries = listRes.data.entries
    .filter(file => file['.tag'] === 'file' && /\.(jpg|jpeg|png)$/i.test(file.name))
    .sort((a, b) => new Date(b.client_modified) - new Date(a.client_modified));

  if (!entries.length) throw new Error('No image files found in Dropbox');

  const latestFile = entries[0];

  const linkRes = await axios.post(
    'https://api.dropboxapi.com/2/files/get_temporary_link',
    { path: latestFile.path_lower },
    {
      headers: {
        Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const tempLink = linkRes.data.link;
  console.log('🔗 Dropbox temporary image URL:', tempLink);
  return tempLink;
}

module.exports = { getLatestImageUrl };
