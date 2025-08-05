import express from 'express';
import { protect, authorizeRoles } from '../Middleware/authMiddleware.js';
import {
  getAllVendorProducts,
  getAllUsers,
  deleteProduct,
  getDashboardSummary
} from '../Controllers/adminController.js';

const router = express.Router();

// ✅ Admin-only routes
router.get('/admin/products', protect, authorizeRoles('Admin'), getAllVendorProducts);
router.get('/admin/users', protect, authorizeRoles('Admin'), getAllUsers);
router.delete('/admin/products/:productId', protect, authorizeRoles('Admin'), deleteProduct);
router.get('/admin/summary', protect, authorizeRoles('Admin'), getDashboardSummary);

export default router;
