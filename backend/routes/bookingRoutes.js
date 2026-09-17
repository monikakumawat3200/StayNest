const express = require('express');
const {
  createBooking,
  getMyTrips,
  getMyListingsBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const { getBookingInvoice } = require('../controllers/invoiceController');

const router = express.Router();

router.use(protect); // All booking routes require authentication

router.post('/', createBooking);
router.get('/my-trips', getMyTrips);
router.get('/my-listings', getMyListingsBookings);
router.delete('/:id', cancelBooking);
router.get('/:id/invoice', getBookingInvoice);

module.exports = router;
