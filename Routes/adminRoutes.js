// adminRoutes.js
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
  updateProduct,
  deleteProduct,
  getAdminProducts,       // ✅ NEW: Import - Get all products by admin
  getAdminProductById,    // ✅ NEW: Import - Get single product by ID
  adminController
} from '../Controllers/adminController.js';

const router = express.Router();

// ======================== AUTH ROUTES ========================
router.post('/auth/register', registerAdmin);
router.post('/auth/login', loginAdmin);

// ======================== PROTECTED ADMIN ROUTES ========================
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);

// ======================== PRODUCT ROUTES ========================

// ✅ CREATE PRODUCT
router.post(
  '/products',
  upload.array('images', 5),
  uploadProductImages,
  createAdminProduct
);

// ✅ READ PRODUCTS
router.get('/products', getAdminProducts);           // ✅ NEW: Get all products by admin
router.get('/products/:id', getAdminProductById);    // ✅ NEW: Get single product by ID

// ✅ UPDATE PRODUCT
router.put(
  '/products/:id',
  upload.array('images', 5),
  uploadProductImages,
  updateProduct
);

// ✅ DELETE PRODUCT
router.delete('/products/:id', deleteProduct);

// // ======================== EXTRA ========================
// router.post('/restricted', adminController);

export default router;
