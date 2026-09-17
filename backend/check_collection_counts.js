const mongoose = require('mongoose');

async function checkCounts() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/staynest');
    console.log('Connected to MongoDB.');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (let col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`Collection: ${col.name} - Documents: ${count}`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

checkCounts();
