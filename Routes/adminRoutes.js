// Routes/adminRoutes.js
import express from 'express';
import { protect, authorizeRoles } from '../Middleware/authMiddleware.js';
import {
  registerAdmin,
  loginAdmin,
  getAdminDashboard,
  getAllUsers,
  deleteUser,
  getSystemStats,
  createAdminProduct,
  adminController
} from '../Controllers/adminController.js';

const router = express.Router();

router.post('/auth/admin/register', registerAdmin);
router.post('/auth/admin/login', loginAdmin);
router.get('/admin/dashboard', getAdminDashboard);
router.get('/admin/users', getAllUsers);
router.delete('/admin/users/:id', deleteUser);
router.get('/admin/stats', getSystemStats);
router.post('/admin/products', createAdminProduct);
router.post('/admin-only', protect, authorizeRoles('admin'), adminController);

export default router;
