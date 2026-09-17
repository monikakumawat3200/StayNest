const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/staynest');
  console.log('Connected to DB');
  
  const Listing = mongoose.model('Listing', new mongoose.Schema({
    title: String,
    location: String,
    category: String,
    images: [String]
  }));
  
  const listings = await Listing.find({ category: 'Cabin' });
  console.log('Total Cabins:', listings.length);
  
  const seen = {};
  const duplicates = [];
  listings.forEach((item) => {
    const key = `${item.title}_${item.location}`;
    if (seen[key]) {
      duplicates.push(item);
    } else {
      seen[key] = true;
    }
  });
  
  console.log('Duplicate listings found in database:', duplicates.length);
  if (duplicates.length > 0) {
    duplicates.forEach(d => console.log(`- ${d.title} in ${d.location}`));
  }
  
  mongoose.connection.close();
}

run();
