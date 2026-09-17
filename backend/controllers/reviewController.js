const mongoose = require('mongoose');
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const logActivity = require('../utils/activityLogger');

const updateListingRatingStats = async (listingId) => {
  const stats = await Review.aggregate([
    { $match: { listing: new mongoose.Types.ObjectId(listingId) } },
    {
      $group: {
        _id: '$listing',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};

// @desc    Create a new review
// @route   POST /api/listings/:listingId/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { rating, comment, photos } = req.body;
    const listingId = req.params.listingId;

    if (!rating || !comment) {
      res.status(400);
      throw new Error('Please add a rating and comment');
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    // Check if user has already reviewed
    const alreadyReviewed = await Review.findOne({ listing: listingId, user: req.user.id });
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this property');
    }

    const review = await Review.create({
      user: req.user.id,
      listing: listingId,
      rating: Number(rating),
      comment,
      photos: photos || [],
      helpfulLikes: []
    });

    await updateListingRatingStats(listingId);
    await logActivity(req.user.id, 'Review Posted', `Posted a ${rating}-star review on listing ${listing.title}`);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a listing with sorting
// @route   GET /api/listings/:listingId/reviews
// @access  Public
const getListingReviews = async (req, res, next) => {
  try {
    const { sort } = req.query;
    const query = { listing: req.params.listingId };

    let sortBy = { createdAt: -1 }; // newest by default
    if (sort === 'highest_rated') {
      sortBy = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest_rated') {
      sortBy = { rating: 1, createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort(sortBy);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment, photos } = req.body;
    let review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Verify owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      res.status(401);
      throw new Error('Not authorized to edit this review');
    }

    review.rating = rating ? Number(rating) : review.rating;
    review.comment = comment || review.comment;
    review.photos = photos || review.photos;

    await review.save();
    await updateListingRatingStats(review.listing);

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Verify owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      res.status(401);
      throw new Error('Not authorized to delete this review');
    }

    const listingId = review.listing;
    await Review.findByIdAndDelete(req.params.id);
    await updateListingRatingStats(listingId);

    await logActivity(req.user.id, 'Review Deleted', `Deleted review for listing ${listingId}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle helpful like on a review
// @route   POST /api/reviews/:id/like
// @access  Private
const likeHelpfulReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    const userId = req.user.id;
    const isLiked = review.helpfulLikes.includes(userId);

    if (isLiked) {
      // Remove like
      review.helpfulLikes = review.helpfulLikes.filter(id => id.toString() !== userId);
    } else {
      // Add like
      review.helpfulLikes.push(userId);
    }

    await review.save();

    res.status(200).json({
      success: true,
      likesCount: review.helpfulLikes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getListingReviews,
  updateReview,
  deleteReview,
  likeHelpfulReview
};
