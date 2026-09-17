const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { toggleWishlist, getWishlist } = require('../controllers/wishlistController');

router.route('/')
  .get(protect, getWishlist);

router.route('/:listingId')
  .post(protect, toggleWishlist);

module.exports = router;
