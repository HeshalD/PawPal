const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send foster end reminder email
const sendFosterEndReminder = async (fosterData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: fosterData.email,
      subject: '🐾 Foster Duration Ending Soon - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6638E6 0%, #E6738F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #6638E6; border-radius: 5px; }
            .button { display: inline-block; background: linear-gradient(135deg, #6638E6 0%, #E6738F 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .highlight { color: #6638E6; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🐾 Foster Duration Reminder</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${fosterData.fullName}</strong>,</p>
              
              <p>This is a friendly reminder that your foster period for <strong>${fosterData.animalName}</strong> is ending soon!</p>
              
              <div class="info-box">
                <h3>Foster Details:</h3>
                <p><strong>Animal Name:</strong> ${fosterData.animalName}</p>
                <p><strong>Animal Type:</strong> ${fosterData.animalType}</p>
                <p><strong>Foster Period:</strong> ${new Date(fosterData.fosterFrom).toLocaleDateString()} - ${new Date(fosterData.fosterTo).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> <span class="highlight">${new Date(fosterData.fosterTo).toLocaleDateString()}</span></p>
              </div>
              
              <h3>📋 Action Required:</h3>
              <p>Please take one of the following actions:</p>
              <ul>
                <li><strong>Collect your pet</strong> - If you're ready to bring your pet home</li>
                <li><strong>Extend foster duration</strong> - If you need more time</li>
                <li><strong>Contact us</strong> - For any questions or concerns</li>
              </ul>
              
              <p>📞 <strong>Contact Information:</strong></p>
              <p>Phone: <a href="tel:+94123456789">+94 123 456 789</a><br>
              Email: <a href="mailto:support@pawpal.com">support@pawpal.com</a></p>
              
              <p style="margin-top: 30px;">Thank you for providing a loving temporary home for ${fosterData.animalName}! Your care and dedication make a real difference.</p>
              
              <div class="footer">
                <p>This is an automated reminder from PawPal Foster Care System</p>
                <p>Reference ID: ${fosterData._id}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reminder email sent to ${fosterData.email} for ${fosterData.animalName}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email when foster request is created
const sendFosterConfirmationEmail = async (fosterData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: fosterData.email,
      subject: '✅ Foster Request Submitted Successfully',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6638E6 0%, #E6738F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #6638E6; border-radius: 5px; }
            .status-badge { display: inline-block; background: #fef9c3; color: #854d0e; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Foster Request Received!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${fosterData.fullName}</strong>,</p>
              
              <p>Thank you for submitting your foster request! We have received your application and it is currently being reviewed.</p>
              
              <div class="info-box">
                <h3>Application Details:</h3>
                <p><strong>Status:</strong> <span class="status-badge">PENDING</span></p>
                <p><strong>Reference ID:</strong> ${fosterData._id}</p>
                <p><strong>Animal Name:</strong> ${fosterData.animalName}</p>
                <p><strong>Animal Type:</strong> ${fosterData.animalType}</p>
                <p><strong>Foster Period:</strong> ${new Date(fosterData.fosterFrom).toLocaleDateString()} - ${new Date(fosterData.fosterTo).toLocaleDateString()}</p>
              </div>
              
              <p>We will review your application and get back to you soon. You will receive email notifications about any updates to your application status.</p>
              
              <p style="margin-top: 30px;">Thank you for your interest in fostering!</p>
              
              <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                This is an automated confirmation from PawPal Foster Care System
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${fosterData.email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendFosterEndReminder,
  sendFosterConfirmationEmail
};
