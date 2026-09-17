const https = require('https');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// We map categories to search terms on Unsplash that return only hotel rooms and building exteriors/facades.
const searchQueries = {
  Cabin: 'cozy-cabin-interior-exterior',
  Beachfront: 'beachfront-villa-hotel',
  Mansion: 'luxury-mansion-house',
  Treehouse: 'treehouse-hotel-room',
  Countryside: 'stone-cottage-house',
  Desert: 'desert-villa-adobe',
  Urban: 'modern-loft-apartment'
};

const outputDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'listings');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Fetch search page HTML
function fetchSearchPage(query) {
  return new Promise((resolve) => {
    const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let html = '';
      res.on('data', chunk => { html += chunk; });
      res.on('end', () => {
        resolve(html);
      });
    }).on('error', () => {
      resolve('');
    });
  });
}

// Download image by ID
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
          console.log(`Downloaded ${category}_${index}.jpg (ID: ${id})`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

async function run() {
  console.log('Scraping Unsplash for real hotel/villa photo IDs...');
  
  const finalMapping = {};
  
  for (const [category, query] of Object.entries(searchQueries)) {
    console.log(`Scraping category "${category}" with search query "${query}"...`);
    const html = await fetchSearchPage(query);
    
    // Find photo IDs. In Unsplash, photo links look like "/photos/something-ID" or "/photos/ID"
    // Let's use a regex to match "/photos/([a-zA-Z0-9_-]+)"
    const regex = /\/photos\/([a-zA-Z0-9_-]+)/g;
    let match;
    const foundIds = new Set();
    
    while ((match = regex.exec(html)) !== null) {
      const id = match[1];
      // Skip common page navigation and static words
      if (['unused', 'plus', 'license', 'terms', 'privacy', 'about', 'join', 'login', 'submit', 'brands', 'explore', 'wallpapers'].includes(id)) {
        continue;
      }
      // If the ID is too long (contains slugs), extract the last part (Unsplash IDs are usually 11 chars or at the end of the slug)
      // e.g. "/photos/cozy-wooden-cabin-FP752bK3b8w"
      const parts = id.split('-');
      const cleanId = parts[parts.length - 1];
      if (cleanId && cleanId.length >= 8 && cleanId.length <= 12) {
        foundIds.add(cleanId);
      }
    }
    
    const uniqueIds = Array.from(foundIds);
    console.log(`Found ${uniqueIds.length} candidate IDs for ${category}:`, uniqueIds.slice(0, 10));
    
    finalMapping[category] = [];
    
    let downloadedCount = 0;
    for (const id of uniqueIds) {
      if (downloadedCount >= 5) break;
      const success = await downloadImage(id, category, downloadedCount + 1);
      if (success) {
        finalMapping[category].push(id);
        downloadedCount++;
        await new Promise(r => setTimeout(r, 200)); // be nice
      }
    }
    
    // Fallback if we couldn't download 5 images from search (e.g. if scraping failed)
    if (downloadedCount < 5) {
      console.warn(`Warning: Scraped only ${downloadedCount} images for ${category}. Filling with backup IDs.`);
      const backups = {
        Cabin: ['U-KtyS3_NQA', 'A85VuQ3X7Wc', 'FP752bK3b8w', 'R-LK3qqdQCg', 'e79l2Qj2b8w'],
        Beachfront: ['y5olJv2bj8s', '1507525428034-b723cf961d3e', '1540555700478-4be289fbecef', '1519046904884-53103b34b206', '1439066615861-d1af74d74000'],
        Mansion: ['1600585154340-be6161a56a0c', '1600596542815-ffad4c1539a9', '1600607687939-ce8a6c25118c', '1512917774080-9991f1c4c750', '1613490493576-7fde63acd811'],
        Treehouse: ['1546548970-71785318a17b', '1508193638397-1c4234db14d8', '1448375240586-882707db888b', '1513836279014-a89f7a76ae86', '1473448912268-2022ce9509d8'],
        Countryside: ['1500382017468-9049fed747ef', '1506744038136-46273834b3fb', '1464822759023-fed622ff2c3b', '1473163928189-364b2c4e1135', '1533105079780-92b9be482077'],
        Desert: ['1509316975850-ff9c5deb0cd9', '1528127269322-539801943592', '1484821582734-6c6c9f99a672', '1523348837708-15d4a09cfac2', '1540555700478-4be289fbecef'],
        Urban: ['1522708323590-d24dbb6b0267', '1502672023488-70e25813eb80', '1502672260266-1c1ef2d93688', '1536376072261-38c75010e6c9', '1560448204-e02f11c3d0e2']
      };
      
      for (let i = downloadedCount; i < 5; i++) {
        const backupId = backups[category][i];
        const success = await downloadImage(backupId, category, i + 1);
        if (success) {
          finalMapping[category].push(backupId);
        }
      }
    }
  }
  
  console.log('Completed scraping and downloading of all listing images!');
  
  // Write the final mapped Unsplash IDs back to a JSON file so that our seed script can read it!
  const mappingPath = path.join(__dirname, 'scripts', 'scraped_images.json');
  fs.writeFileSync(mappingPath, JSON.stringify(finalMapping, null, 2));
  console.log(`Saved image mappings to ${mappingPath}`);
  process.exit(0);
}

run();
