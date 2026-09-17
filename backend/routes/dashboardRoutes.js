const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getOwnerDashboard, getAdminDashboard } = require('../controllers/dashboardController');

router.get('/owner', protect, getOwnerDashboard);
router.get('/admin', protect, getAdminDashboard);

module.exports = router;
