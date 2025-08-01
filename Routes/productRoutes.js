import express from 'express';
import { createProduct, getAllProducts } from '../Controllers/productController.js';
import { protect, authorizeRoles } from '../Middleware/authMiddleware.js';
import upload from '../Middleware/multer.js';

const router = express.Router();

router.post('/products', protect, authorizeRoles('vendor'), upload.array('images', 5), createProduct);
router.get('/products', getAllProducts);

export default router;
