import User from '../Models/userModel.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';


const { JWT_SECRET, EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE } = process.env;

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Send welcome email
const sendWelcomeEmail = async (email, name, role) => {
  const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: `Welcome to Taste of North Ghana`,
    html: `<p>Hi ${name},</p><p>Thank you for signing up as a <strong>${role}</strong>. We're excited to have you onboard!</p>`
  };

  await transporter.sendMail(mailOptions);
};

// Register user
export const register = async (req, res) => {
  try {
    let { name, email, password, confirmPassword, role, businessName } = req.body;

    email = email.toLowerCase();
    role = role.toLowerCase();

    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      businessName: role === 'vendor' ? businessName : undefined
    });

    await newUser.save();
    await sendWelcomeEmail(email, name, role);

    const token = generateToken(newUser);
    res.status(201).json({
      message: 'Registration successful.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateToken(user);
    res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
