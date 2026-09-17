const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  createReview,
  getListingReviews,
  updateReview,
  deleteReview,
  likeHelpfulReview
} = require('../controllers/reviewController');

// Wired as: /api/listings/:listingId/reviews OR /api/reviews
router.route('/')
  .post(protect, createReview)
  .get(getListingReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.post('/:id/like', protect, likeHelpfulReview);

module.exports = router;
