import express from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import { getDashboard } from '../Controllers/dashboardController.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboard);

export default router;
