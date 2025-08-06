// Utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // Default to Gmail if not set
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your Gmail App Password
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.html] - HTML body
 * @param {string} [options.text] - Plain text body
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Taste of North Ghana" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html || '',
      text: text || ''
    });

    // ✅ Log SMTP server response for debugging
    console.log(`✅ Email sent to: ${to}`);
    console.log(`📨 SMTP Response: ${info.response}`);
  } catch (error) {
    // ❌ Log full error details, not just message
    console.error('❌ Email failed:', error);
    throw new Error('Email sending failed');
  }
};

export default sendEmail;
