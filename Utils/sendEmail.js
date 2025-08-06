import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Create transporter for Gmail using App Password
const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error('❌ Email credentials missing:');
    console.error('❌ EMAIL_USER:', emailUser ? '✅ Set' : '❌ Missing');
    console.error('❌ EMAIL_PASS:', emailPass ? '✅ Set' : '❌ Missing');
    throw new Error('Email credentials are not properly configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    },
    secure: true,
    port: 465,
    debug: true, // Enable debug logging
    logger: true // Enable logging
  });
};

const transporter = createEmailTransporter();

// ✅ Verify transporter configuration on startup
const verifyEmailConfig = async () => {
  try {
    // Check if credentials are loaded
    console.log('🔍 Environment Variables Check:');
    console.log('📧 EMAIL_USER exists:', !!process.env.EMAIL_USER);
    console.log('📧 EMAIL_USER value:', process.env.EMAIL_USER);
    console.log('📧 EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('📧 EMAIL_PASS length:', process.env.EMAIL_PASS?.length || 0);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Missing EMAIL_USER or EMAIL_PASS in environment variables');
      return;
    }
    
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    console.error('❌ Full error:', error);
  }
};

// Call verification when module loads
verifyEmailConfig();

// ✅ Enhanced function to send email with detailed logging
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // 🔍 Enhanced input validation and logging
    console.log('📤 Attempting to send email...');
    console.log('📧 From:', process.env.EMAIL_USER);
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Has HTML:', !!html);
    console.log('📧 Has Text:', !!text);

    // Validate required fields
    if (!to) {
      throw new Error('Recipient email address is required');
    }
    if (!subject) {
      throw new Error('Email subject is required');
    }
    if (!html && !text) {
      throw new Error('Either HTML or text content is required');
    }

    const mailOptions = {
      from: `"Taste of North Ghana" <${process.env.EMAIL_USER}>`,
      to: to.trim(), // Trim whitespace
      subject,
      html: html || '',
      text: text || ''
    };

    console.log('📨 Mail options:', JSON.stringify(mailOptions, null, 2));

    const info = await transporter.sendMail(mailOptions);

    // 🔍 Detailed success logging
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📬 Accepted recipients:', info.accepted);
    console.log('📬 Rejected recipients:', info.rejected);
    console.log('📬 Server Response:', info.response);

    return info;
  } catch (error) {
    // 🔍 Enhanced error logging
    console.error('❌ Email sending failed:');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error stack:', error.stack);
    
    // Re-throw with more context
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

export default sendEmail;