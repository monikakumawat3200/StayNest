const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a listing title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a listing description'],
    },
    images: {
      type: [String],
      required: [true, 'Please add at least one image'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a nightly price'],
    },
    location: {
      type: String,
      required: [true, 'Please add a city/location'],
    },
    country: {
      type: String,
      required: [true, 'Please add a country'],
    },
    facilities: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['Cabin', 'Beachfront', 'Mansion', 'Treehouse', 'Countryside', 'Desert', 'Urban'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lat: {
      type: Number,
      default: 0,
    },
    lng: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    unavailableDates: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Listing', listingSchema);
