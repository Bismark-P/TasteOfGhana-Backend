import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../Controllers/productController.js';
import { protect } from '../Middleware/authMiddleware.js'; // Optional

const router = express.Router();

router.post('/products', protect, createProduct);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', protect, updateProduct);
router.delete('/products/:id', protect, deleteProduct);

export default router;
