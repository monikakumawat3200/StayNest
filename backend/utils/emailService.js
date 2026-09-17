const logActivity = require('./activityLogger');

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------------------------------------------');
    // Remove tags for short console print
    const textPreview = html.replace(/<[^>]*>/g, ' ').substring(0, 150) + '...';
    console.log(`Content Preview: ${textPreview}`);
    console.log('=======================================================\n');
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
};

module.exports = sendEmail;
