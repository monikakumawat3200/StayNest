const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfileDetails,
  updateProfile,
  changePassword,
  adminToggleBlockUser,
  adminDeleteUser
} = require('../controllers/userController');

router.get('/profile', protect, getProfileDetails);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes
router.put('/:id/block', protect, adminToggleBlockUser);
router.delete('/:id', protect, adminDeleteUser);

module.exports = router;
