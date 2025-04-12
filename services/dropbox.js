const axios = require('axios');
const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

async function getLatestImageUrl() {
  try {
    const listRes = await axios.post(
      'https://api.dropboxapi.com/2/files/list_folder',
      { path: '' }, // Set a folder path if needed
      {
        headers: {
          Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('🔄 Dropbox response:', JSON.stringify(listRes.data, null, 2));

    const entries = listRes.data.entries
      .filter(file => file['.tag'] === 'file' && /\.(jpg|jpeg|png)$/i.test(file.name));

    console.log(`📁 Found ${entries.length} image file(s) in Dropbox`);
    entries.forEach(file => {
      console.log(`- ${file.name} (modified: ${file.client_modified})`);
    });

    if (!entries.length) throw new Error('No image files found in Dropbox');

    const latestFile = entries.sort((a, b) => new Date(b.client_modified) - new Date(a.client_modified))[0];
    console.log(`📌 Latest image selected: ${latestFile.name}`);

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
  } catch (err) {
    console.error('❌ Dropbox API error:', err.message || err.response?.data);
    throw err;
  }
}

module.exports = { getLatestImageUrl };
