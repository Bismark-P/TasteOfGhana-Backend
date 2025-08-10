// Models/cartModel.js
import Cart from '../Schemas/cartSchema.js';

/**
 * Create a new cart for a user
 */
const createCart = async (userId) => {
  const cart = new Cart({ userId, items: [], total: 0 });
  return await cart.save();
};

/**
 * Retrieve a user's cart
 */
const getCartByUser = async (userId) => {
  return await Cart.findOne({ userId });
};

/**
 * Update a user's cart
 */
const updateCart = async (userId, updatedCart) => {
  return await Cart.findOneAndUpdate({ userId }, updatedCart, { new: true });
};

/**
 * Delete a user's cart
 */
const deleteCart = async (userId) => {
  return await Cart.findOneAndDelete({ userId });
};

// ✅ Named exports
export {
  createCart,
  getCartByUser,
  updateCart,
  deleteCart
};

// ✅ Optional default export (if you prefer importing as a module)
export default {
  createCart,
  getCartByUser,
  updateCart,
  deleteCart
};
