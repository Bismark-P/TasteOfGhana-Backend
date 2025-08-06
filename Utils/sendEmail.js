import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Create transporter for Gmail using App Password
const transporter = nodemailer.createTransport({
  service: 'gmail', // Fixed to Gmail
  auth: {
    user: process.env.EMAIL_USER, // e.g., mail.tasteofnorthghana@gmail.com
    pass: process.env.EMAIL_PASS  // Gmail App Password (16 chars)
  },
  secure: true, // Force SSL/TLS
  port: 465
});

// ✅ Function to send email
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Taste of North Ghana" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html || '',
      text: text || ''
    });

    // 🔍 Detailed logging
    console.log('✅ Email send attempt completed.');
    console.log('📨 Message ID:', info.messageId);
    console.log('📬 Server Response:', info.response);

    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error('Email sending failed');
  }
};

export default sendEmail;
