// Controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import { registerSchema, loginSchema } from '../Schemas/authSchema.js';
import sendEmail from '../Utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const TOKEN_EXPIRES = process.env.JWT_EXPIRES_IN || '30d';

// Allowed roles for user registration (only these two allowed here)
const ALLOWED_ROLES = ['Customer', 'Vendor'];

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
};

// ====================== REGISTER ======================
export const register = async (req, res) => {
  try {
    // Validate input and get normalized value (Joi can return normalized values)
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const msg = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ message: msg });
    }

    // Destructure validated/normalized values
    let { name, email, password, confirmPassword, role } = value;

    // Ensure email is normalized to lowercase
    email = (email || '').toLowerCase().trim();

    // Normalize role (accept vendor/customer in any case)
    role = (role || '').toString();
    role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Role must be either Customer or Vendor.' });
    }

    // Check if email already exists (case-insensitive)
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    // Double-check passwords match (Joi already validated confirmPassword, but keep guard)
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName: name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Send welcome email but don't fail the registration if email errors
    try {
      await sendEmail({
        to: newUser.email,
        subject: 'Welcome to Taste of North Ghana!',
        text: `Hi ${newUser.fullName}, welcome aboard as a ${newUser.role}!`,
        html: `<p>Hi <strong>${newUser.fullName}</strong>, welcome aboard as a <strong>${newUser.role}</strong>!</p>`
      });
    } catch (emailErr) {
      // log and continue — user creation succeeded
      console.error('Welcome email failed:', emailErr?.message ?? emailErr);
    }

    // Return success with token
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      },
      token: generateToken(newUser._id, newUser.role)
    });
  } catch (err) {
    console.error('Register Error (full):', err);

    // Handle Mongo duplicate key race / unique index errors gracefully
    if (err?.code === 11000 && err?.keyValue?.email) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const msg = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ message: msg });
    }

    let { email, password } = value;

    // normalize email
    email = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id, user.role)
    });
  } catch (err) {
    console.error('Login Error (full):', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};
