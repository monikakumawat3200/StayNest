const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

dotenv.config();

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staynest');
    console.log('MongoDB Connected for Clearing...');

    await Booking.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});
    
    console.log('All data (Users, Listings, Bookings) has been successfully deleted from the database.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error clearing database: ${error.message}`);
    process.exit(1);
  }
};

clearData();
