// Routes/adminAuthRoutes.js
import express from 'express';
import { registerAdmin, loginAdmin } from '../Controllers/adminAuthController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; 


const router = express.Router();

router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);
router.post('/admin-only', protect, authorizeRoles('admin'), adminController); 
router.post('/vendor-zone', protect, authorizeRoles('vendor'), vendorController);

export default router;


// // routes/adminAuthRoutes.js

// import express from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import Admin from '../Models/adminModel.js';

// const router = express.Router();

// // Admin registration with secret key
// router.post('/admin/register', async (req, res) => {
//   try {
//     const { name, email, password, secretKey } = req.body;

//     if (secretKey !== process.env.ADMIN_SECRET) {
//       return res.status(401).json({ message: 'Unauthorized access' });
//     }

//     const existing = await Admin.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ message: 'Admin already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newAdmin = await Admin.create({
//       name,
//       email,
//       password: hashedPassword
//     });

//     res.status(201).json({ message: 'Admin registered successfully' });
//   } catch (error) {
//     console.error('Admin Registration Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Admin login
// router.post('/admin/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { id: admin._id, email: admin.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       admin: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email
//       }
//     });
//   } catch (error) {
//     console.error('Admin Login Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// export default router;
