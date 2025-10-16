const Foster = require('../Models/FosterModel');
const { sendFosterEndReminder } = require('../utils/emailService');

// Check for fosters ending soon and send reminders
const checkFosterEndDates = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check for fosters ending in the next 3 days
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    // Find approved fosters that are ending soon
    const fosters = await Foster.find({
      status: 'approved',
      fosterTo: {
        $gte: today.toISOString().split('T')[0],
        $lte: threeDaysFromNow.toISOString().split('T')[0]
      }
    });

    console.log(`🔍 Found ${fosters.length} foster(s) ending in the next 3 days`);

    // Send reminder emails
    for (const foster of fosters) {
      const fosterToDate = new Date(foster.fosterTo);
      const daysUntilEnd = Math.ceil((fosterToDate - today) / (1000 * 60 * 60 * 24));
      
      console.log(`📧 Sending reminder for ${foster.animalName} (ends in ${daysUntilEnd} days) to ${foster.email}`);
      await sendFosterEndReminder(foster);
    }

    return { success: true, count: fosters.length };
  } catch (error) {
    console.error('❌ Error checking foster end dates:', error);
    return { success: false, error: error.message };
  }
};

// Initialize scheduler to run daily at 9 AM
const initializeFosterScheduler = () => {
  console.log('🚀 Foster reminder scheduler initialized');
  
  // Run immediately on startup for testing
  console.log('⏰ Running initial foster end date check...');
  checkFosterEndDates();
  
  // Schedule to run daily at 9 AM
  const scheduleDaily = () => {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(9, 0, 0, 0);
    
    // If 9 AM has passed today, schedule for tomorrow
    if (now > scheduledTime) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilRun = scheduledTime - now;
    
    setTimeout(() => {
      console.log('⏰ Running scheduled foster end date check...');
      checkFosterEndDates();
      // Schedule next run (24 hours later)
      setInterval(() => {
        console.log('⏰ Running scheduled foster end date check...');
        checkFosterEndDates();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilRun);
    
    console.log(`⏰ Next check scheduled for: ${scheduledTime.toLocaleString()}`);
  };
  
  scheduleDaily();
};

module.exports = {
  checkFosterEndDates,
  initializeFosterScheduler
};
