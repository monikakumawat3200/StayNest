const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getInbox, getThread } = require('../controllers/messageController');

router.route('/')
  .post(protect, sendMessage);

router.get('/inbox', protect, getInbox);
router.get('/thread/:otherUserId', protect, getThread);

module.exports = router;
