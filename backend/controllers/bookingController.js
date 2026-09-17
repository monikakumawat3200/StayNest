const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;

    if (!listingId || !checkIn || !checkOut) {
      res.status(400);
      throw new Error('Please select dates and property');
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404);
      throw new Error('Property not found');
    }

    // Verify user is not booking their own listing
    if (listing.host.toString() === req.user.id) {
      res.status(400);
      throw new Error('You cannot book your own property');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      res.status(400);
      throw new Error('Check-out date must be after check-in date');
    }

    // Check if dates are already booked
    const overlap = await Booking.findOne({
      listing: listingId,
      status: 'confirmed',
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (overlap) {
      res.status(400);
      throw new Error('The selected dates are already booked by someone else');
    }

    // Calculate total price
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = diffDays * listing.price;

    const booking = await Booking.create({
      listing: listingId,
      user: req.user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: 'confirmed',
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's trips (bookings made by the logged-in user)
// @route   GET /api/bookings/my-trips
// @access  Private
const getMyTrips = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'listing',
        populate: { path: 'host', select: 'name email' },
      })
      .sort({ checkIn: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get host's listings bookings (bookings made on listings hosted by user)
// @route   GET /api/bookings/my-listings
// @access  Private
const getMyListingsBookings = async (req, res, next) => {
  try {
    // First find all listings hosted by current user
    const listings = await Listing.find({ host: req.user.id });
    const listingIds = listings.map((item) => item._id);

    // Find bookings on those listings
    const bookings = await Booking.find({ listing: { $in: listingIds } })
      .populate('listing')
      .populate('user', 'name email')
      .sort({ checkIn: 1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('listing');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Make sure user is the booker or host of the property
    const isBooker = booking.user.toString() === req.user.id;
    const isHost = booking.listing.host.toString() === req.user.id;

    if (!isBooker && !isHost) {
      res.status(401);
      throw new Error('User not authorized to cancel this booking');
    }

    // Delete or cancel the booking
    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyTrips,
  getMyListingsBookings,
  cancelBooking,
};
