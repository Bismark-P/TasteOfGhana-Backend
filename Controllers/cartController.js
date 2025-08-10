// Controllers/cartController.js
const Cart = require('../models/CartSchema');

exports.addToCart = async (req, res) => {
  const { userId, productId, title, price, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], total: 0 });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, title, price, quantity });
    }

    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart', details: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart', details: err.message });
  }
};

exports.removeItem = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item', details: err.message });
  }
};
