const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createCheckoutSession, confirmPaymentSession } = require('../controllers/paymentController');

router.post('/checkout', protect, createCheckoutSession);
router.post('/confirm', protect, confirmPaymentSession);

module.exports = router;
