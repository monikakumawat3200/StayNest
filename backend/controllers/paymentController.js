const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const logActivity = require('../utils/activityLogger');

// @desc    Create Stripe Checkout Session (Simulated / Test Mode)
// @route   POST /api/payments/checkout
// @access  Private
const createCheckoutSession = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      res.status(400);
      throw new Error('Please select a booking to check out');
    }

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Generate a simulated checkout session ID
    const sessionId = `sess_${Math.random().toString(36).substring(2, 15)}`;
    
    // We return a mock session and redirection URL to the frontend Stripe page
    res.status(200).json({
      success: true,
      sessionId,
      url: `/checkout/${sessionId}?bookingId=${bookingId}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm Stripe Payment (Simulated / Test Mode)
// @route   POST /api/payments/confirm
// @access  Private
const confirmPaymentSession = async (req, res, next) => {
  try {
    const { bookingId, sessionId } = req.body;

    if (!bookingId || !sessionId) {
      res.status(400);
      throw new Error('Please include bookingId and sessionId');
    }

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Update booking status
    booking.status = 'confirmed'; // confirms paid booking
    await booking.save();

    // Mark dates as unavailable in listing
    const start = new Date(booking.checkIn);
    const end = new Date(booking.checkOut);
    const datesToBlock = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      datesToBlock.push(new Date(d));
    }

    await Listing.findByIdAndUpdate(booking.listing._id, {
      $addToSet: { unavailableDates: { $each: datesToBlock } }
    });

    await logActivity(req.user.id, 'Booking Paid', `Completed Stripe payment of $${booking.totalPrice} for booking on ${booking.listing.title}`);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  confirmPaymentSession
};
