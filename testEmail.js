// testEmail.js
import sendEmail from './Utils/sendEmail.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Starting testEmail.js...');

(async () => {
  try {
    const info = await sendEmail({
      to: 'pinkrahbismark.bp@gmail.com',
      subject: 'Test Email from Taste of North Ghana',
      text: 'Hello! This is a test email.',
      html: '<p>Hello! This is a <strong>test email</strong>.</p>'
    });
    console.log('✅ Email sent:', info);
  } catch (err) {
    console.error('❌ Email failed:', err.message);
  }
})();
