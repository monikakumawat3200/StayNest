const express = require('express');
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Re-route into review router
router.use('/:listingId/reviews', reviewRouter);

router.route('/')
  .get(getListings)
  .post(protect, createListing);

router.route('/:id')
  .get(getListingById)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

module.exports = router;
