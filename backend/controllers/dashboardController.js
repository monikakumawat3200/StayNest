const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get Owner Dashboard Analytics
// @route   GET /api/dashboard/owner
// @access  Private (Owner/Host)
const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // 1. Fetch owner listings
    const listings = await Listing.find({ host: ownerId });
    const listingIds = listings.map(l => l._id);

    // 2. Aggregate stats
    const totalListings = listings.length;
    const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);

    const bookings = await Booking.find({ listing: { $in: listingIds }, status: 'confirmed' });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // 3. Get recent reviews on owner properties
    const recentReviews = await Review.find({ listing: { $in: listingIds } })
      .populate('user', 'name avatar')
      .populate('listing', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Calculate monthly charts data (last 6 months)
    const monthlyCharts = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const monthBookings = bookings.filter(b => b.createdAt >= startOfMonth && b.createdAt <= endOfMonth);
      const bookingCount = monthBookings.length;
      const revenueSum = monthBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      monthlyCharts.push({
        name: `${monthName} ${year}`,
        bookings: bookingCount,
        revenue: revenueSum
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalListings,
        totalViews,
        totalBookings,
        totalRevenue,
        recentReviews,
        monthlyCharts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminDashboard = async (req, res, next) => {
  try {
    // Check if user is Admin
    if (req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }

    // 1. Core platform metrics
    const totalUsers = await User.countDocuments({});
    const totalListings = await Listing.countDocuments({});
    const totalReviews = await Review.countDocuments({});
    
    const bookings = await Booking.find({ status: 'confirmed' });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // 2. Mod Lists
    const usersList = await User.find({}).select('name email role avatar createdAt').sort({ createdAt: -1 });
    const listingsList = await Listing.find({}).populate('host', 'name email').sort({ createdAt: -1 });
    const reviewsList = await Review.find({})
      .populate('user', 'name email')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    // 3. Calculate system charts data (last 6 months)
    const monthlyCharts = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const monthBookings = bookings.filter(b => b.createdAt >= startOfMonth && b.createdAt <= endOfMonth);
      const bookingCount = monthBookings.length;
      const revenueSum = monthBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      monthlyCharts.push({
        name: `${monthName} ${year}`,
        bookings: bookingCount,
        revenue: revenueSum
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalListings,
        totalReviews,
        totalBookings,
        totalRevenue,
        usersList,
        listingsList,
        reviewsList,
        monthlyCharts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOwnerDashboard,
  getAdminDashboard
};
