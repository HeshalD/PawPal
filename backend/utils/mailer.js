const nodemailer = require('nodemailer');

// Configure transporter using environment variables
// Required ENV:
// - SMTP_HOST
// - SMTP_PORT (usually 587 for TLS)
// - SMTP_USER
// - SMTP_PASS (or app password)
// Optional ENV:
// - SMTP_FROM (display/sender email). Defaults to fernandoshameth1@gmail.com

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[Mailer] SMTP env vars not set. Emails will be logged to console only.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  });
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || 'fernandoshameth1@gmail.com';

  // Basic validation
  if (!to) {
    console.warn('[Mailer] No recipient provided');
    return { ok: false, skipped: true };
  }

  const tx = getTransporter();
  const mailOptions = {
    from,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  };

  if (!tx) {
    console.log('[Mailer] Simulated email send (no SMTP configured):', mailOptions);
    return { ok: true, simulated: true };
  }

  try {
    const info = await tx.sendMail(mailOptions);
    console.log('[Mailer] Email sent:', info.messageId);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Mailer] Send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendEmail };
