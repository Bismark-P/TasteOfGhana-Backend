import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // Prevent Admin role from public registration
    if (role === 'Admin') {
      return res.status(403).json({ message: "Unauthorized role" });
    }

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


// import dotenv from 'dotenv';
// dotenv.config();

// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import User from '../Models/userModel.js';
// import { sendEmail } from '../Utils/sendEmail.js'; // <-- Make sure this path is correct

// const JWT_SECRET = process.env.JWT_SECRET;

// export const register = async (req, res) => {
//   try {
//     const { name, email, password, confirmPassword, role } = req.body;

//     if (password !== confirmPassword)
//       return res.status(400).json({ message: "Passwords do not match." });

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Email already exists." });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await User.create({ name, email, password: hashedPassword, role });

//     // Send welcome email
//     await sendEmail(
//       email,
//       "Welcome to Taste of North Ghana",
//       `<h2>Hello ${name},</h2>
//        <p>Thanks for signing up! We're excited to have you on board.</p>
//        <p>Best regards,<br><strong>Taste of North Ghana Team</strong></p>`
//     );

//     res.status(201).json({ success: true, message: "Registered successfully. Email sent." });
//   } catch (err) {
//     console.error("Registration Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

//     res.status(200).json({
//       success: true,
//       token,
//       user: { id: user._id, name: user.name, role: user.role }
//     });
//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ message: "Login error", error: err.message });
//   }
// };





// // import dotenv from 'dotenv';
// // dotenv.config();

// // import bcrypt from 'bcrypt';
// // import jwt from 'jsonwebtoken';
// // import User from '../Models/userModel.js';

// // console.log("JWT_SECRET:", process.env.JWT_SECRET);

// // const JWT_SECRET = process.env.JWT_SECRET;
// // console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);


// // export const register = async (req, res) => {
// //   try {
// //     const { name, email, password, confirmPassword, role } = req.body;

// //     if (password !== confirmPassword)
// //       return res.status(400).json({ message: "Passwords do not match." });

// //     const existing = await User.findOne({ email });
// //     if (existing) return res.status(400).json({ message: "Email already exists." });

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const newUser = await User.create({ name, email, password: hashedPassword, role });

// //     res.status(201).json({ success: true, message: "Registered successfully." });
// //   } catch (err) {
// //     res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // };

// // export const login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;
// //     const user = await User.findOne({ email });
// //     if (!user) return res.status(401).json({ message: "Invalid credentials" });

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

// //     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

// //     res.status(200).json({
// //       success: true,
// //       token,
// //       user: { id: user._id, name: user.name, role: user.role }
// //     });
// //   } catch (err) {
// //     res.status(500).json({ message: "Login error", error: err.message });
// //   }
// // };
