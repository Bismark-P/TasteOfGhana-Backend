// Routes/userRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../Middleware/authMiddleware.js';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getVendorDashboard,
  getCustomerDashboard
} from '../Controllers/userController.js';

const router = express.Router();

// Public routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/dashboard/vendor', protect, authorizeRoles('vendor'), getVendorDashboard);
router.get('/dashboard/customer', protect, authorizeRoles('user'), getCustomerDashboard);

export default router;
