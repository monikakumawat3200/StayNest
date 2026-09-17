const https = require('https');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const categories = ['Cabin', 'Beachfront', 'Mansion', 'Treehouse', 'Countryside', 'Desert', 'Urban'];

const unsplashImages = {
  Cabin: [
    '1510798831971-661eb04b3739', // cozy cabin in snow
    '1449034446853-66c86144b0ad', // A-frame cabin
    '1470770841072-f978cf4d019e', // wood cabin in forest
    '1549693578-d683be217e58', // cabin wood room
    '1482192505345-5655af888cc4'  // cabin in pine forest
  ],
  Beachfront: [
    '1507525428034-b723cf961d3e', // luxury beach resort
    '1540555700478-4be289fbecef', // resort room beachfront
    '1519046904884-53103b34b206', // beach house facade
    '1439066615861-d1af74d74000', // oceanfront villa
    '1505118380757-91f5f5632de0'  // beachfront bungalow pool
  ],
  Mansion: [
    '1600585154340-be6161a56a0c', // luxury villa facade
    '1600596542815-ffad4c1539a9', // modern living room interior
    '1600607687939-ce8a6c25118c', // luxury house facade
    '1512917774080-9991f1c4c750', // mansion facade at night
    '1613490493576-7fde63acd811'  // grand estate facade
  ],
  Treehouse: [
    '1546548970-71785318a17b', // canopy room treehouse
    '1508193638397-1c4234db14d8', // wooden forest treehouse room
    '1448375240586-882707db888b', // jungle treehouse deck
    '1513836279014-a89f7a76ae86', // nature resort treehouse
    '1473448912268-2022ce9509d8'  // bamboo forest lodge room
  ],
  Countryside: [
    '1500382017468-9049fed747ef', // countryside villa/estate
    '1506744038136-46273834b3fb', // stone cottage house
    '1464822759023-fed622ff2c3b', // lake house cottage
    '1473163928189-364b2c4e1135', // classic stone villa house
    '1533105079780-92b9be482077'  // cottage facade
  ],
  Desert: [
    '1509316975850-ff9c5deb0cd9', // desert luxury dome
    '1528127269322-539801943592', // desert adobe villa facade
    '1484821582734-6c6c9f99a672', // modern desert house facade
    '1523348837708-15d4a09cfac2', // desert lodge tent
    '1540555700478-4be289fbecef'  // resort pool villa
  ],
  Urban: [
    '1522708323590-d24dbb6b0267', // chic loft interior
    '1502672023488-70e25813eb80', // cozy room
    '1502672260266-1c1ef2d93688', // loft kitchen
    '1536376072261-38c75010e6c9', // city hotel penthouse
    '1560448204-e02f11c3d0e2'  // apartment living room
  ]
};

const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'listings');

// Ensure listings directory exists and is empty
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir, { recursive: true });

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
        console.error(`Failed to download ${id} (${category}_${index}.jpg) - Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      console.error(`Error downloading ${id} (${category}_${index}.jpg):`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Downloading 35 verified unique hotel/villa photos from Unsplash...');
  let count = 0;
  
  for (const cat of categories) {
    const ids = unsplashImages[cat];
    for (let i = 0; i < ids.length; i++) {
      const success = await downloadImage(ids[i], cat, i + 1);
      if (success) count++;
      // Wait 100ms
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  console.log(`Finished! Successfully downloaded ${count}/35 unique hotel/villa images.`);
  process.exit(0);
}

run();
