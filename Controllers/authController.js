import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import sendEmail from '../Utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

// ====================== REGISTER ======================
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    console.log('📥 Registration attempt:', { name, email, role });

    // ✅ Validate input
    if (!name || !email || !password || !confirmPassword || !role) {
      console.log('⚠️ Missing required fields.');
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      console.log('⚠️ Passwords do not match.');
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('⚠️ Invalid email format:', email);
      return res.status(400).json({ message: "Invalid email format." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ Email already exists:', email);
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    console.log('✅ User created:', newUser.email);

    // ✅ Send welcome email with enhanced error handling
    let emailSent = false;
    let emailError = null;

    try {
      console.log('📤 Preparing to send welcome email...');
      console.log('📤 Recipient:', email);
      console.log('📤 Recipient name:', name);
      console.log('📤 Recipient role:', role);

      const emailInfo = await sendEmail({
        to: email,
        subject: 'Welcome to Taste of North Ghana!',
        text: `Hi ${name}, welcome aboard as a ${role}!`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin-bottom: 10px;">Welcome to Taste of North Ghana!</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #27ae60; margin-top: 0;">Hello, ${name}! 👋</h2>
              <p style="font-size: 16px; color: #2c3e50; margin-bottom: 15px;">
                We're thrilled to have you join our community as a <strong style="color: #e74c3c;">${role}</strong>!
              </p>
              <p style="font-size: 14px; color: #7f8c8d; line-height: 1.6;">
                Get started by exploring our marketplace and connecting with customers. 
                We're here to support your journey every step of the way.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 12px; color: #95a5a6;">
                Best regards,<br>
                <strong>Taste of North Ghana Team</strong>
              </p>
            </div>
          </div>
        `
      });

      emailSent = true;
      console.log('✅ Welcome email sent successfully:', {
        messageId: emailInfo?.messageId,
        accepted: emailInfo?.accepted,
        response: emailInfo?.response
      });

    } catch (emailErr) {
      emailError = emailErr.message;
      console.error('❌ Error sending welcome email:', emailErr.message);
      console.error('❌ Full email error:', emailErr);
    }

    // ✅ Send response (don't fail registration if email fails)
    res.status(201).json({
      success: true,
      message: emailSent 
        ? "Registration successful! Welcome email sent." 
        : `Registration successful! Note: Welcome email could not be sent (${emailError})`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      emailSent: emailSent
    });

  } catch (err) {
    console.error('❌ Register Error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      console.log('⚠️ Missing login credentials.');
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found.');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch.');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    console.log('✅ Login successful:', user.email);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// ====================== TEST EMAIL ENDPOINT (for debugging) ======================
export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required for testing" });
    }

    console.log('🧪 Testing email to:', email);

    const emailInfo = await sendEmail({
      to: email,
      subject: 'Test Email from Taste of North Ghana',
      text: 'This is a test email to verify email functionality.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email to verify that the email system is working correctly.</p>
          <p>If you received this, the email configuration is working!</p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      details: {
        messageId: emailInfo.messageId,
        accepted: emailInfo.accepted,
        response: emailInfo.response
      }
    });

  } catch (err) {
    console.error('❌ Test Email Error:', err);
    res.status(500).json({ 
      success: false,
      message: "Test email failed", 
      error: err.message 
    });
  }
};