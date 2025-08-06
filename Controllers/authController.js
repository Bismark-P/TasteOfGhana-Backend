import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import sendEmail from '../Utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ====================== REGISTER ======================
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    console.log('📥 Registration attempt:', { name, email, role });

    // ✅ Check passwords match
    if (password !== confirmPassword) {
      console.log('⚠️ Passwords do not match.');
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // ✅ Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ Email already exists:', email);
      return res.status(400).json({ message: "Email already exists." });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    console.log('✅ User created:', newUser.email);

    // ✅ Send welcome email
    try {
      console.log('📤 Sending welcome email...');
      const emailInfo = await sendEmail({
        to: email,
        subject: 'Welcome to Taste of North Ghana!',
        text: `Hi ${name}, welcome aboard as a ${role}!`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Welcome, ${name}!</h2>
            <p>We’re excited to have you join us as a <strong>${role}</strong>.</p>
            <p>Get started by exploring our marketplace and connecting with customers.</p>
            <br>
            <p style="color: #888;">Taste of North Ghana Team</p>
          </div>
        `
      });

      console.log('✅ Email sent:', {
        messageId: emailInfo.messageId,
        accepted: emailInfo.accepted,
        response: emailInfo.response
      });

    } catch (emailErr) {
      console.error('❌ Error sending welcome email:', emailErr.message);
      // Optional: Log but don't block registration
    }

    res.status(201).json({
      success: true,
      message: "Registered successfully. Welcome email sent.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
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

    // ✅ Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found.');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch.');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate token
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
