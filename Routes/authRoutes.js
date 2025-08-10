import express from 'express';
import { registerUser, loginUser } from '../Controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;



// import express from 'express';
// import { register, login } from '../Controllers/authController.js';

// const router = express.Router();

// router.post('/register', register);
// router.post('/login', login);

// export default router;
