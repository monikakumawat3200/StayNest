const Booking = require('../models/Booking');

// @desc    Get Invoice Data for Booking
// @route   GET /api/bookings/:id/invoice
// @access  Private
const getBookingInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('user', 'name email')
      .populate({
        path: 'listing',
        populate: { path: 'host', select: 'name email' }
      });

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Ensure logged-in user is the booker or the host
    const isBooker = booking.user._id.toString() === req.user.id;
    const isHost = booking.listing.host._id.toString() === req.user.id;

    if (!isBooker && !isHost && req.user.role !== 'Admin') {
      res.status(401);
      throw new Error('Not authorized to view this invoice');
    }

    res.status(200).json({
      success: true,
      invoiceNumber: `INV-${booking._id.toString().substring(18).toUpperCase()}`,
      issueDate: new Date(),
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookingInvoice
};
