import express from 'express';
import { register, login } from '../Controllers/authController.js';

const router = express.Router();

// ---------------------
// USER / VENDOR routes
// ---------------------
router.post('/register', register);
router.post('/login', login);

// ---------------------
// ADMIN routes
// ---------------------
router.post('/admin/register', (req, res, next) => {
  // Force role to Admin for admin registration
  req.body.role = 'Admin';
  register(req, res, next);
});

router.post('/admin/login', login);

export default router;
