// Schemas/cartSchema.js
import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;




// // Schemas/cartSchema.js
// import mongoose from 'mongoose';

// const CartItemSchema = new mongoose.Schema({
//   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//   title: { type: String, required: true },
//   price: { type: Number, required: true },
//   quantity: { type: Number, default: 1 },
// });

// const CartSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   items: [CartItemSchema],
//   total: { type: Number, default: 0 },
// }, { timestamps: true });

// const Cart = mongoose.model('Cart', CartSchema);
// export default Cart;



// // // Schemas/cartSchema.js
// // const mongoose = require('mongoose');

// // const CartItemSchema = new mongoose.Schema({
// //   productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
// //   title: { type: String, required: true },
// //   price: { type: Number, required: true },
// //   quantity: { type: Number, default: 1 },
// // });

// // const CartSchema = new mongoose.Schema({
// //   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// //   items: [CartItemSchema],
// //   total: { type: Number, default: 0 },
// // }, { timestamps: true });

// // module.exports = mongoose.model('Cart', CartSchema);
