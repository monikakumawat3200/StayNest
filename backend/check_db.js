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
  
  const item = await Listing.findOne({ title: 'Modern Woodland Hideaway' });
  if (item) {
    console.log('Title:', item.title);
    console.log('Price:', item.price);
    console.log('Location:', item.location);
    console.log('Image URL:', item.images[0]);
  } else {
    console.log('Listing not found');
  }
  mongoose.connection.close();
}

run();
