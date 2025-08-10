// Schemas/orderSchema.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    region: String,
    phone: String,
  },
  paymentMethod: { type: String, enum: ['Paystack', 'MobileMoney', 'Cash'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
}, { timestamps: true });

export default OrderSchema;
