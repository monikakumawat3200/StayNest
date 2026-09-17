const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details = '') => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.error('Activity logging failed:', error.message);
  }
};

module.exports = logActivity;
