const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/staynest');
  const Listing = mongoose.model('Listing', new mongoose.Schema({
    title: String,
    price: Number,
    location: String,
    category: String,
    images: [String]
  }));
  
  const items = await Listing.find({}).limit(5);
  console.log('Listings found:', items.length);
  for (let item of items) {
    console.log(`- ${item.title} (${item.location})`);
  }
  mongoose.connection.close();
}

run();
