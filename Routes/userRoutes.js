// Routes/userRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../Middleware/authMiddleware.js';
import {
  getUserProfile,
  getVendorDashboard,
  getCustomerDashboard
} from '../Controllers/userController.js';

const router = express.Router();

// 🛑 The public register and login routes are now handled by authRoutes.js.
// Keeping them here creates conflicts and is not good practice.

// Protected routes
// These routes are mounted at '/api' in index.js,
// resulting in the desired URLs: /api/profile, /api/dashboard/vendor, etc.
router.get('/profile', protect, getUserProfile);
router.get('/dashboard/vendor', protect, authorizeRoles('vendor'), getVendorDashboard);
router.get('/dashboard/customer', protect, authorizeRoles('user'), getCustomerDashboard);

export default router;