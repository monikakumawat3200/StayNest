const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const { 
      category, 
      search, 
      host, 
      minPrice, 
      maxPrice, 
      rating, 
      wifi, 
      pool, 
      gym, 
      parking, 
      breakfast, 
      kitchen, 
      ac, 
      tv, 
      washer, 
      petFriendly,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by host
    if (host) {
      query.host = host;
    }

    // Search query (city, title, country)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { country: searchRegex },
        { description: searchRegex }
      ];
    }

    // Price filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Facilities filters
    const facilitiesFilter = [];
    if (wifi === 'true') facilitiesFilter.push('WiFi');
    if (pool === 'true') facilitiesFilter.push('Pool');
    if (gym === 'true') facilitiesFilter.push('Gym');
    if (parking === 'true') facilitiesFilter.push('Parking');
    if (breakfast === 'true') facilitiesFilter.push('Breakfast');
    if (kitchen === 'true') facilitiesFilter.push('Kitchen');
    if (ac === 'true') facilitiesFilter.push('Air Conditioning');
    if (tv === 'true') facilitiesFilter.push('TV');
    if (washer === 'true') facilitiesFilter.push('Washing Machine');
    if (petFriendly === 'true') facilitiesFilter.push('Pet Friendly');

    if (facilitiesFilter.length > 0) {
      query.facilities = { $all: facilitiesFilter };
    }

    // Sorting
    let sortBy = { createdAt: -1 }; // default: newest
    if (sort === 'price_asc') {
      sortBy = { price: 1 };
    } else if (sort === 'price_desc') {
      sortBy = { price: -1 };
    } else if (sort === 'rating_desc') {
      sortBy = { averageRating: -1, reviewCount: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const listings = await Listing.find(query)
      .populate('host', 'name email avatar')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    const total = await Listing.countDocuments(query);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('host', 'name email avatar');

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res, next) => {
  try {
    const { title, description, price, location, country, facilities, category, images } = req.body;

    if (!title || !description || !price || !location || !country || !category) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    // Default image if none provided
    const listingImages = images && images.length > 0 ? images : ['/images/cabin.jpg'];

    const listing = await Listing.create({
      title,
      description,
      price,
      location,
      country,
      facilities: facilities || [],
      category,
      images: listingImages,
      host: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    // Make sure user is host
    if (listing.host.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized to update this listing');
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    // Make sure user is host
    if (listing.host.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized to delete this listing');
    }

    // Delete associated bookings
    await Booking.deleteMany({ listing: req.params.id });

    // Use findByIdAndDelete to trigger middlewares if any
    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
