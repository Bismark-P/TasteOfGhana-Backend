// Utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail', // Default to Gmail if not set
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your Gmail App Password
  }
});

// Function to send emails
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    await transporter.sendMail({
      from: `"Taste of North Ghana" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html || '',  // Optional HTML body
      text: text || ''   // Optional plain text
    });
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error('Email failed:', error.message);
    throw new Error('Email sending failed');
  }
};

// Export default so import sendEmail works
export default sendEmail;
