const https = require('https');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const categories = ['Cabin', 'Beachfront', 'Mansion', 'Treehouse', 'Countryside', 'Desert', 'Urban'];

const keywords = {
  Cabin: 'cabin',
  Beachfront: 'beach',
  Mansion: 'mansion',
  Treehouse: 'treehouse',
  Countryside: 'cottage',
  Desert: 'desert',
  Urban: 'loft'
};

const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'listings');

// Ensure listings directory exists and is empty
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

function downloadImage(category, index) {
  return new Promise((resolve) => {
    const query = keywords[category];
    // Use LoremFlickr with lock parameter to guarantee unique consistent images
    const url = `https://loremflickr.com/600/400/${encodeURIComponent(query)}?lock=${index}`;
    const dest = path.join(outputDir, `${category}_${index}.jpg`);
    const file = fs.createWriteStream(dest);

    https.get(url, (res) => {
      // LoremFlickr returns a 302 redirect to the actual image.
      // We must follow the redirect if necessary.
      if (res.statusCode === 302 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = `https://loremflickr.com${redirectUrl}`;
        }
        https.get(redirectUrl, (redirectRes) => {
          if (redirectRes.statusCode === 200) {
            redirectRes.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log(`Downloaded ${category}_${index}.jpg`);
              resolve(true);
            });
          } else {
            file.close();
            fs.unlink(dest, () => {});
            console.error(`Failed on redirect for ${category}_${index}.jpg - Status: ${redirectRes.statusCode}`);
            resolve(false);
          }
        }).on('error', (err) => {
          file.close();
          fs.unlink(dest, () => {});
          console.error(`Error on redirect for ${category}_${index}.jpg:`, err.message);
          resolve(false);
        });
      } else if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded ${category}_${index}.jpg`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        console.error(`Failed to download ${category}_${index}.jpg - Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      console.error(`Error downloading ${category}_${index}.jpg:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Downloading 35 unique category-focused accommodation images locally...');
  let count = 0;
  
  for (const cat of categories) {
    for (let i = 1; i <= 5; i++) {
      const success = await downloadImage(cat, i);
      if (success) count++;
      // Wait 100ms between requests to be nice
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  console.log(`Finished! Successfully downloaded ${count}/210 images locally.`);
  process.exit(0);
}

run();
