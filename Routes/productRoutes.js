import express from 'express';
import { createProduct, getAllProducts } from '../Controllers/productController.js';
import { protect, authorizeRoles } from '../Middleware/authMiddleware.js';
import upload from '../Middleware/multer.js';

const router = express.Router();

// Public route
router.get('/products', getAllProducts);

// Vendor/Admin only route for adding products
router.post(
  '/products',
  protect,
  authorizeRoles('Vendor', 'Admin'),
  upload.array('images', 5),
  createProduct
);

export default router;
