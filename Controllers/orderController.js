// Controllers/orderController.js
import Order from '../Models/orderModel.js';
import Cart from '../Models/cartModel.js'; // Assumes cart is stored in DB
import sendOrderEmail from '../Utils/sendOrderEmail.js'; // Optional email utility

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingFee = 30; // Flat rate or dynamic
    const tax = subtotal * 0.075;
    const total = subtotal + shippingFee + tax;

    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      subtotal,
      shippingFee,
      tax,
      total,
    });

    await order.save();
    await Cart.deleteOne({ user: userId });

    if (req.body.sendEmail) {
      await sendOrderEmail(userId, order);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
