// routes/orderRoutes.js
import express from 'express';
import { createOrder, getUserOrders } from '../Controllers/orderController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/mine', protect, getUserOrders);

export default router;
