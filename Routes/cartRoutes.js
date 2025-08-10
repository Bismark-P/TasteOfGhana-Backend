// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController.js');

router.post('/add', cartController.addToCart);
router.get('/:userId', cartController.getCart);
router.delete('/remove', cartController.removeItem);

module.exports = router;
