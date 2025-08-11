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

// ✅ Auth routes
router.post('/auth/register', registerAdmin); // POST /api/admin/auth/register
router.post('/auth/login', loginAdmin);       // POST /api/admin/auth/login

// ✅ Protected admin routes
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);   // GET /api/admin/dashboard
router.get('/users', getAllUsers);             // GET /api/admin/users
router.delete('/users/:id', deleteUser);       // DELETE /api/admin/users/:id
router.get('/stats', getSystemStats);          // GET /api/admin/stats
router.post('/products', createAdminProduct);  // POST /api/admin/products
router.post('/restricted', adminController);   // POST /api/admin/restricted

export default router;
