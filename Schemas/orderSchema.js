import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' } // Optional: multi-vendor
    }
  ],

  totalAmount: { type: Number, required: true },

  // Optional: Discounts
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String },
  finalAmount: { type: Number },

  // Optional: Delivery Info
  deliveryInfo: {
    recipientName: String,
    phone: String,
    address: String,
    region: String,
    deliveryMethod: { type: String, enum: ['pickup', 'rider', 'courier'] },
    instructions: String
  },

  // Fulfillment Tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,

  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['momo', 'card', 'bank-transfer', 'ussd', 'cash-on-delivery'],
    required: true
  },
  paymentProcessor: {
    type: String,
    enum: ['paystack', 'manual'],
    default: function () {
      return this.paymentMethod === 'cash-on-delivery' ? 'manual' : 'paystack';
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentReference: String,

  // Soft Delete & Audit
  deleted: { type: Boolean, default: false },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: Date
}, {
  timestamps: true
});

export default orderSchema;
