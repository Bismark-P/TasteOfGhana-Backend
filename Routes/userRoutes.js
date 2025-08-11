// Routes/userRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../Middleware/authMiddleware.js';
import { getDashboard } from '../Controllers/dashboardController.js'; // ✅ CORRECTED: Import the new controller
import { getUserProfile } from '../Controllers/userController.js';  // Keep getUserProfile separate

const router = express.Router();

// 🛑 The public register and login routes are now handled by authRoutes.js.
// Keeping them here creates conflicts and is not good practice.

// Protected routes
// These routes are mounted at '/api' in index.js,
// resulting in the desired URLs: /api/profile, /api/dashboard/vendor, etc.
router.get('/profile', protect, getUserProfile);  // Profile is still handled by a separate controller
router.get('/dashboard/vendor', protect, authorizeRoles('vendor'), getDashboard);  // ✅ Now uses getDashboard
router.get('/dashboard/customer', protect, authorizeRoles('user'), getDashboard);  // ✅ Now uses getDashboard

export default router;