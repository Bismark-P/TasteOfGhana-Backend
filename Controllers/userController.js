// controllers/userController.js
import User from '../Models/userModel.js';
import bcrypt from 'bcryptjs';
import generateToken from '../Utils/generateToken.js';
import sendWelcomeEmail from '../Utils/sendWelcomeEmail.js';

// 📝 Register
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    // 📧 Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      console.error('❌ Failed to send welcome email:', emailErr.message);
    }

    res.status(201).json({
      // ✅ UPDATED: Let Mongoose handle the conversion
      ...user.toObject(),
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// 🔐 Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      // ✅ UPDATED: Let Mongoose handle the conversion
      ...user.toObject(),
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// 👤 Profile
export const getUserProfile = async (req, res) => {
  try {
    // This one was already correct
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧑 Vendor Dashboard
export const getVendorDashboard = async (req, res) => {
  res.json({ message: `Welcome Vendor ${req.user.name}` });
};

// 🧍 Customer Dashboard
export const getCustomerDashboard = async (req, res) => {
  res.json({ message: `Welcome Customer ${req.user.name}` });
};