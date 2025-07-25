import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';

console.log("JWT_SECRET:", process.env.JWT_SECRET);

const JWT_SECRET = process.env.JWT_SECRET;
console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);


export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ success: true, message: "Registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};
