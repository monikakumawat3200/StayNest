const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function getRedirect(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.headers.location);
    });
  });
}

async function run() {
  const url = 'https://loremflickr.com/600/400/desert?lock=1';
  const loc = await getRedirect(url);
  console.log('Redirects to:', loc);
}

run();
