const Message = require('../models/Message');
const User = require('../models/User');
const Listing = require('../models/Listing');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, listingId, content } = req.body;

    if (!recipientId || !listingId || !content) {
      res.status(400);
      throw new Error('Please include recipient, listing, and message content');
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      res.status(404);
      throw new Error('Recipient not found');
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      listing: listingId,
      content
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate('listing', 'title');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's inbox threads (grouped messages)
// @route   GET /api/messages/inbox
// @access  Private
const getInbox = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate('listing', 'title images')
      .sort({ createdAt: -1 });

    // Group by thread key (listingId + otherUserId) to return list of threads
    const threadsMap = {};
    for (const msg of messages) {
      const otherUser = msg.sender._id.toString() === userId ? msg.recipient : msg.sender;
      if (!otherUser) continue;
      
      const threadKey = `${msg.listing?._id || 'direct'}_${otherUser._id}`;
      if (!threadsMap[threadKey]) {
        threadsMap[threadKey] = {
          listing: msg.listing,
          otherUser,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unread: false // simple chat state
        };
      }
    }

    const threads = Object.values(threadsMap);

    res.status(200).json({
      success: true,
      count: threads.length,
      data: threads
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation history thread
// @route   GET /api/messages/thread/:otherUserId
// @access  Private
const getThread = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const { listingId } = req.query;

    const query = {
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    };

    if (listingId) {
      query.listing = listingId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .populate('listing', 'title')
      .sort({ createdAt: 1 }); // chronological order

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getInbox,
  getThread
};
