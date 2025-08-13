// controllers/authController.js
import User from '../Models/userModel.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { registerSchema, loginSchema } from '../Utils/userValidation.js';

const { JWT_SECRET, EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE } = process.env;

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

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

export const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((err) => err.message)
    });
  }

  try {
    let { name, email, password, confirmPassword, role, businessName } = req.body;

    email = email.toLowerCase().trim();
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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      businessName: role === 'vendor' ? businessName : undefined
    });

    await newUser.save();
    await sendWelcomeEmail(email, name, role);

    const token = generateToken(newUser);
    const userResponse = newUser.toObject();
    delete userResponse._id;
    delete userResponse.__v;
    userResponse.id = newUser._id;
    
    res.status(201).json({
      message: 'Registration successful.',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((err) => err.message)
    });
  }

  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email }).select('-password -__v');
    if (!user) {
      console.log("⚠ No user found for email:", email);
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName || null
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
