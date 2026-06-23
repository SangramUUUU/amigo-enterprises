const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

async function sendEmail({ to, subject, text }) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[email noop] To: ${to} | ${subject} | ${text}`);
    return;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM || 'noreply@amigo-enterprises.local',
    to,
    subject,
    text,
  });
}

module.exports = { sendEmail };
