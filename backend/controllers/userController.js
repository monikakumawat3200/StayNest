const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const logActivity = require('../utils/activityLogger');

// @desc    Get user profile details & statistics
// @route   GET /api/users/profile
// @access  Private
const getProfileDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const totalListings = await Listing.countDocuments({ host: req.user.id });
    const totalReviews = await Review.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        blocked: user.blocked,
        joinedDate: user.createdAt,
        totalListings,
        totalReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile info
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar, role } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.avatar = avatar !== undefined ? avatar : user.avatar;
    user.role = role || user.role;

    await user.save();
    await logActivity(req.user.id, 'Profile Updated', 'Updated profile information');

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        joinedDate: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please fill in both current and new passwords');
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid current password');
    }

    // Save new password (pre-save hook will hash it automatically)
    user.password = newPassword;
    await user.save();
    await logActivity(req.user.id, 'Password Changed', 'Successfully changed user password');

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Block or unblock a user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const adminToggleBlockUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }

    const userToBlock = await User.findById(req.params.id);
    if (!userToBlock) {
      res.status(404);
      throw new Error('User to block/unblock not found');
    }

    if (userToBlock.role === 'Admin') {
      res.status(400);
      throw new Error('Cannot block another Administrator');
    }

    userToBlock.blocked = !userToBlock.blocked;
    await userToBlock.save();

    const action = userToBlock.blocked ? 'Blocked User' : 'Unblocked User';
    await logActivity(req.user.id, action, `${action}: ${userToBlock.name} (${userToBlock.email})`);

    res.status(200).json({
      success: true,
      message: `User successfully ${userToBlock.blocked ? 'blocked' : 'unblocked'}`,
      data: userToBlock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const adminDeleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      res.status(404);
      throw new Error('User not found');
    }

    if (userToDelete.role === 'Admin') {
      res.status(400);
      throw new Error('Cannot delete an Administrator');
    }

    await User.findByIdAndDelete(req.params.id);
    // Delete their listings and reviews as cleanup
    await Listing.deleteMany({ host: req.params.id });
    await Review.deleteMany({ user: req.params.id });

    await logActivity(req.user.id, 'User Purged', `Admin purged user: ${userToDelete.name} (${userToDelete.email})`);

    res.status(200).json({
      success: true,
      message: 'User and all associated properties successfully deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileDetails,
  updateProfile,
  changePassword,
  adminToggleBlockUser,
  adminDeleteUser
};
