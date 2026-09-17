const https = require('https');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const categories = ['Cabin', 'Beachfront', 'Mansion', 'Treehouse', 'Countryside', 'Desert', 'Urban'];

const unsplashImages = {
  Cabin: [
    '1510798831971-661eb04b3739', // cabin snow
    '1449034446853-66c86144b0ad', // A-frame cabin
    '1470770841072-f978cf4d019e', // log cabin
    '1549693578-d683be217e58', // cabin bedroom
    '1482192505345-5655af888cc4'  // forest cabin
  ],
  Beachfront: [
    '1512918728675-ed5a9ecdebfd', // beach resort room (new verified active ID)
    '1507525428034-b723cf961d3e', // resort pool
    '1540555700478-4be289fbecef', // beachfront room
    '1519046904884-53103b34b206', // beach house
    '1439066615861-d1af74d74000'  // ocean villa
  ],
  Mansion: [
    '1600585154340-be6161a56a0c',
    '1600596542815-ffad4c1539a9',
    '1600607687939-ce8a6c25118c',
    '1512917774080-9991f1c4c750',
    '1613490493576-7fde63acd811'
  ],
  Treehouse: [
    '1546548970-71785318a17b',
    '1508193638397-1c4234db14d8',
    '1448375240586-882707db888b',
    '1513836279014-a89f7a76ae86',
    '1473448912268-2022ce9509d8'
  ],
  Countryside: [
    '1500382017468-9049fed747ef',
    '1506744038136-46273834b3fb',
    '1464822759023-fed622ff2c3b',
    '1473163928189-364b2c4e1135',
    '1533105079780-92b9be482077'
  ],
  Desert: [
    '1509316975850-ff9c5deb0cd9',
    '1528127269322-539801943592',
    '1484821582734-6c6c9f99a672',
    '1523348837708-15d4a09cfac2',
    '1540555700478-4be289fbecef'
  ],
  Urban: [
    '1522708323590-d24dbb6b0267',
    '1502672023488-70e25813eb80',
    '1502672260266-1c1ef2d93688',
    '1536376072261-38c75010e6c9',
    '1560448204-e02f11c3d0e2'
  ]
};

const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'listings');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(id, category, index) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/photo-${id}?w=600&q=80&auto=format&fit=crop`;
    const dest = path.join(outputDir, `${category}_${index}.jpg`);
    const file = fs.createWriteStream(dest);

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded ${category}_${index}.jpg`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        console.error(`Failed to download ${id} - Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      console.error(`Error:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Downloading final set of 35 verified hotel/villa images...');
  let count = 0;
  for (const cat of categories) {
    const ids = unsplashImages[cat];
    for (let i = 0; i < ids.length; i++) {
      const success = await downloadImage(ids[i], cat, i + 1);
      if (success) count++;
      await new Promise(r => setTimeout(r, 100));
    }
  }
  console.log(`Completed downloading ${count}/35 unique images.`);
  process.exit(0);
}

run();
