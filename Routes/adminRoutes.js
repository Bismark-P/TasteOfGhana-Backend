// Routes/adminRoutes.js
import express from 'express';
import upload from '../Middleware/multer.js';
import uploadProductImages from '../Middleware/uploadImages.js';
import { protect, authorizeRoles } from '../Middleware/authMiddleware.js';
import {
  registerAdmin,
  loginAdmin,
  getAdminDashboard,
  getAllUsers,
  deleteUser,
  getSystemStats,
  createAdminProduct,
  updateProduct, // ✅ NEW: Import updateProduct
  deleteProduct, // ✅ NEW: Import deleteProduct
  adminController
} from '../Controllers/adminController.js';

const router = express.Router();

// Auth routes
router.post('/auth/register', registerAdmin);
router.post('/auth/login', loginAdmin);

// Protected admin routes
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);

// ✅ UPDATED PRODUCT ROUTES
router.post(
  '/products',
  upload.array('images', 5),
  uploadProductImages,
  createAdminProduct
);

router.put(
  '/products/:id',
  upload.array('images', 5),
  uploadProductImages,
  updateProduct
);

router.delete('/products/:id', deleteProduct);

router.post('/restricted', adminController);

export default router;