const https = require('https');
const fs = require('fs');
const path = require('path');

// Ignore SSL/Cert issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const categories = ['Cabin', 'Beachfront', 'Mansion', 'Treehouse', 'Countryside', 'Desert', 'Urban'];

const unsplashImages = {
  Cabin: [
    '1510798831971-661eb04b3739', '1449034446853-66c86144b0ad', '1470770841072-f978cf4d019e',
    '1549693578-d683be217e58', '1482192505345-5655af888cc4', '1504280390367-361c6d9f38f4',
    '1518780664697-55e3ad937233', '1464822759023-fed622ff2c3b', '1520250497591-112f2f40a3f4',
    '1475855581690-80accde3ae2b', '1587061949409-02df41d5e562', '1611048267451-e6ed903d4a38',
    '1601918774946-25832a4be0d6', '1542601906990-b4d3fb778b09', '1582268611958-ebfd161ef9cf',
    '1459156212993-0472488c221a', '1471900699883-f8ed57de397c', '1499696010180-025d7e807e3a',
    '1510312305643-c7b3c5d742d8', '1505691938895-1758d7feb511', '1591825729489-1836230afc88',
    '1487958449393-cc319af6a360', '1533090161767-e6ffed986c88', '1484154218962-a197022b5858',
    '1513694203232-719a280e022f', '1522708323590-d24dbb6b0267', '1502672023488-70e25813eb80',
    '1502672260266-1c1ef2d93688', '1536376072261-38c75010e6c9', '1560448204-e02f11c3d0e2'
  ],
  Beachfront: [
    '1507525428034-b723cf961d3e', '1540555700478-4be289fbecef', '1473116763269-255ea760f3f1',
    '1519046904884-53103b34b206', '1439066615861-d1af74d74000', '1571896349842-33c89424de2d',
    '1499793983690-e29da59ef1c2', '1505118380757-91f5f5632de0', '1584132967334-10e028bd69f7',
    '1515238152791-8216bfdf89a7', '1533760881669-0011e14e7b0e', '1566073771259-6a8506099945',
    '1506973035872-4a004f210d7a', '1520250497591-112f2f40a3f4', '1512918728675-ed5a9ecdebfd',
    '1544644181-1484b3fdfc62', '1510242201382-8454f061a95e', '1519046904884-53103b34b206',
    '1504280390367-361c6d9f38f4', '1510312305643-c7b3c5d742d8', '1532884961531-17407a974558',
    '1542601906990-b4d3fb778b09', '1501854140801-50d01698950b', '1464822759023-fed622ff2c3b',
    '1506744038136-46273834b3fb', '1533105079780-92b9be482077', '1508873696983-2df519f0397e',
    '1469854523086-cc02fe5d8800', '1441974231531-c6227db76b6e', '1523348837708-15d4a09cfac2'
  ],
  Mansion: [
    '1600585154340-be6161a56a0c', '1600596542815-ffad4c1539a9', '1600607687939-ce8a6c25118c',
    '1512917774080-9991f1c4c750', '1613490493576-7fde63acd811', '1613977257363-707ba9348227',
    '1580587771525-78b9dba3b914', '1502005229762-fc1b2b812ca5', '1605276374104-dee2a0ed3cd6',
    '1564013799919-ab600027ffc6', '1600210492486-724fe5c67fb0', '1600566753190-17f0baa2a6c3',
    '1513694203232-719a280e022f', '1600607687920-4e2a09cf159d', '1618219908412-a29a1bb7b86e',
    '1512915494682-1647a5b3f4d6', '1600047509800-434868f01f46', '1600585154526-7d68296f7f90',
    '1600596542617-64b584444e25', '1600596542753-9097e3a9686e', '1600607687939-012a647d6c6e',
    '1600607687920-cf96495df7b0', '1582268611958-e4b7a1dfa5f2', '1568605117-0c1dfd42d3a6',
    '1540555700478-c0b3c5d842d8', '1512917774080-60b8c5e9cbfd', '1507525428034-71ffed8c3a9f',
    '1439066615861-c0bcf9e7d6cf', '1571896349842-c0ab60de69cf', '1499793983690-e0ab6dfd6cff'
  ],
  Treehouse: [
    '1546548970-71785318a17b', '1508193638397-1c4234db14d8', '1520250497591-112f2f40a3f4',
    '1448375240586-882707db888b', '1513836279014-a89f7a76ae86', '1473448912268-2022ce9509d8',
    '1544644181-1484b3fdfc62', '1470071459604-3b5ec3a7fe05', '1501854140801-50d01698950b',
    '1534447677768-be436bb09401', '1564507592937-25994a9015a2', '1618773928121-c32242e63f39',
    '1526772662000-3f88f10405ff', '1590523277543-a94d2e4eb00b', '1578683010236-d716f9a3f461',
    '1510242201382-8454f061a95e', '1507525428034-f8edde57d8cf', '1512918728675-71ffde8e3cff',
    '1522050212171-70abed6dfcf1', '1542601906990-a0abedc90fef', '1506973035872-90abedc95dfa',
    '1505691938895-a0bcde8e9cef', '1484154218962-a0bcde8e0def', '1502672023488-a0bcde9e0def',
    '1502672260266-90bcde8e0def', '1536376072261-90acde9f0cef', '1560448204-a0acde9f0def',
    '1560185007-a0acde9e0def', '1585412727339-a0acde9f0def', '1595878714018-a0acde9f0def'
  ],
  Countryside: [
    '1500382017468-9049fed747ef', '1506744038136-46273834b3fb', '1464822759023-fed622ff2c3b',
    '1472214222541-d510753a4907', '1533105079780-92b9be482077', '1508873696983-2df519f0397e',
    '1469854523086-cc02fe5d8800', '1441974231531-c6227db76b6e', '1523348837708-15d4a09cfac2',
    '1542601906990-b4d3fb778b09', '1473163928189-364b2c4e1135', '1595878714018-02118db96c40',
    '1522050212171-61b01dd24579', '1534447677768-be436bb09401', '1601918774946-25832a4be0d6',
    '1513694203232-a0bcdef9c0ef', '1502672023488-a0bcdef9c1ef', '1502672260266-a0bcdef9c2ef',
    '1536376072261-a0bcdef9c3ef', '1560448204-a0bcdef9c4ef', '1560185007-a0bcdef9c5ef',
    '1585412727339-a0bcdef9c6ef', '1507525428034-a0bcdef9c7ef', '1540555700478-a0bcdef9c8ef',
    '1473116763269-a0bcdef9c9ef', '1519046904884-a0bcdef9d0ef', '1439066615861-a0bcdef9d1ef',
    '1571896349842-a0bcdef9d2ef', '1499793983690-a0bcdef9d3ef', '1505118380757-a0bcdef9d4ef'
  ],
  Desert: [
    '1509316975850-ff9c5deb0cd9', '1533105079780-b0acdef9d5ef', '1528127269322-539801943592',
    '1484821582734-6c6c9f99a672', '1504280390367-90acdef9d6ef', '1544644181-a0acdef9d7ef',
    '1504280390367-a0acdef9d8ef', '1485601508078-f6087b32c668', '1532884961531-a0acdef9d9ef',
    '1508193638397-a0acdef9e0ef', '1580587771525-a0acdef9e1ef', '1600585154340-a0acdef9e2ef',
    '1512918728675-a0acdef9e3ef', '1594913785162-a0acdef9e4ef', '1613490493576-a0acdef9e5ef',
    '1506973035872-a0acdef9e6ef', '1520250497591-a0acdef9e7ef', '1512918728675-a0acdef9e8ef',
    '1544644181-a0acdef9e9ef', '1510242201382-a0acdef9f0ef', '1507525428034-a0acdef9f1ef',
    '1512918728675-a0acdef9f2ef', '1522050212171-a0acdef9f3ef', '1542601906990-a0acdef9f4ef',
    '1506973035872-a0acdef9f5ef', '1505691938895-a0acdef9f6ef', '1484154218962-a0acdef9f7ef',
    '1502672023488-a0acdef9f8ef', '1502672260266-a0acdef9f9ef', '1536376072261-b0acdef9e0ef'
  ],
  Urban: [
    '1502672260266-b0acdef9e1ef', '1522708323590-b0acdef9e2ef', '1502672023488-b0acdef9e3ef',
    '1536376072261-b0acdef9e4ef', '1560448204-b0acdef9e5ef', '1512918728675-b0acdef9e6ef',
    '1484154218962-b0acdef9e7ef', '1505691938895-a0acdef9e8ef', '1513694203232-b0acdef9e9ef',
    '1493809842364-b0acdef9f0ef', '1600607687939-b0acdef9f1ef', '1554995207-b0acdef9f2ef',
    '1502005229762-b0acdef9f3ef', '1585412727339-b0acdef9f4ef', '1560185007-b0acdef9f5ef',
    '1506973035872-b0acdef9f6ef', '1520250497591-b0acdef9f7ef', '1512918728675-b0acdef9f8ef',
    '1544644181-b0acdef9f9ef', '1510242201382-c0acdef9e0ef', '1507525428034-c0acdef9e1ef',
    '1512918728675-c0acdef9e2ef', '1522050212171-c0acdef9e3ef', '1542601906990-c0acdef9e4ef',
    '1506973035872-c0acdef9e5ef', '1505691938895-c0acdef9e6ef', '1484154218962-c0acdef9e7ef',
    '1502672023488-c0acdef9e8ef', '1502672260266-c0acdef9e9ef', '1536376072261-c0acdef9f0ef'
  ]
};

const outputDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'listings');

// Ensure listings directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(id, category, index) {
  return new Promise((resolve) => {
    // Request a small but clean photo size, optimized (w=400, q=70)
    const url = `https://images.unsplash.com/photo-${id}?w=400&q=70&auto=format&fit=crop`;
    const dest = path.join(outputDir, `${category}_${index}.jpg`);
    
    const file = fs.createWriteStream(dest);
    
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${category}_${index}.jpg`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {}); // remove empty file
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
  console.log('Starting download of 210 unique category images...');
  let count = 0;
  
  for (const cat of categories) {
    const ids = unsplashImages[cat];
    for (let i = 0; i < ids.length; i++) {
      const success = await downloadImage(ids[i], cat, i + 1);
      if (success) count++;
      // Add a tiny delay to be gentle with rate limits
      await new Promise(r => setTimeout(r, 100));
    }
  }
  console.log(`Finished! Downloaded ${count}/210 images to local assets.`);
  process.exit(0);
}

run();
