// Routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../Controllers/productController.js';
import { protect } from '../Middleware/authMiddleware.js';
import { isVendor } from '../Middleware/roleMiddleware.js';

const router = express.Router();

router.post('/products', protect, isVendor, createProduct);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', protect, isVendor, updateProduct);
router.delete('/products/:id', protect, isVendor, deleteProduct);

export default router;
