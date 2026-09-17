const User = require('../models/User');
const Listing = require('../models/Listing');

// @desc    Toggle a listing in the user's wishlist
// @route   POST /api/wishlist/:listingId
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const listingId = req.params.listingId;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    const idx = user.wishlist.indexOf(listingId);
    let added = false;

    if (idx > -1) {
      // Remove from wishlist
      user.wishlist.splice(idx, 1);
    } else {
      // Add to wishlist
      user.wishlist.push(listingId);
      added = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      added,
      message: added ? 'Listing added to wishlist' : 'Listing removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's wishlist listings
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      populate: { path: 'host', select: 'name email avatar' }
    });

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleWishlist,
  getWishlist
};
