const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/staynest');
  const Listing = mongoose.model('Listing', new mongoose.Schema({
    title: String,
    images: [String],
    category: String,
    location: String
  }));
  
  const item = await Listing.findOne({ title: 'Cozy Adobe Haven' });
  if (item) {
    console.log('Title:', item.title);
    console.log('Category:', item.category);
    console.log('Location:', item.location);
    console.log('Images:', item.images);
  } else {
    console.log('Listing not found');
  }
  mongoose.connection.close();
}

run();
