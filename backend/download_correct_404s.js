const https = require('https');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'listings');

function download(id, name) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;
    const dest = path.join(outputDir, name);
    const file = fs.createWriteStream(dest);

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded ${name} successfully.`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        console.error(`Failed to download ${id} (${name}) - Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      console.error(`Error downloading ${id} (${name}):`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  await download('1473163928189-364b2c4e1135', 'Countryside_4.jpg');
  await download('1523348837708-15d4a09cfac2', 'Desert_4.jpg');
  process.exit(0);
}

run();
