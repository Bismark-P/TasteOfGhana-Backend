import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Special Admin Registration
router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, secretKey } = req.body;

    // Validate special secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: "Unauthorized to register as admin" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({ name, email, password: hashedPassword, role: 'Admin' });

    res.status(201).json({ success: true, message: "Admin registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'Admin' });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      token,
      user: { id: admin._id, name: admin.name, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

export default router;



// import express from 'express';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import User from '../Models/userModel.js';

// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET;

// // ✅ Special Admin Registration
// router.post('/admin/register', async (req, res) => {
//   try {
//     const { name, email, password, confirmPassword, secretKey } = req.body;

//     // ✅ Check special admin secret (you set in .env)
//     if (secretKey !== process.env.ADMIN_SECRET_KEY) {
//       return res.status(403).json({ message: "Unauthorized to register as admin" });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Email already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newAdmin = await User.create({ name, email, password: hashedPassword, role: 'Admin' });

//     res.status(201).json({ success: true, message: "Admin registered successfully." });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // ✅ Admin Login
// router.post('/admin/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const admin = await User.findOne({ email, role: 'Admin' });
//     if (!admin) return res.status(401).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });

//     res.status(200).json({
//       success: true,
//       token,
//       user: { id: admin._id, name: admin.name, role: admin.role }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Login error", error: err.message });
//   }
// });

// export default router;
