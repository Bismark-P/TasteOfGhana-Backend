import mongoose from 'mongoose';
import normalizeMongoose from 'normalize-mongoose';

const orderSchema = new mongoose.Schema(
  {
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
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
      }
    ],

    totalAmount: { type: Number, required: true },

    // Optional: Discounts
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    finalAmount: { type: Number }, // can be auto-calculated or passed

    // Delivery Info
    deliveryInfo: {
      recipientName: { type: String },
      phone: { type: String },
      address: { type: String },
      region: { type: String },
      deliveryMethod: {
        type: String,
        enum: ['pickup', 'rider', 'courier']
      },
      instructions: { type: String }
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
    paymentReference: { type: String },
    paidAt: { type: Date },

    // Soft Delete & Audit
    deleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

// 🔹 Virtual: Auto-calculate final amount if not passed
orderSchema.virtual('calculatedTotal').get(function () {
  return this.totalAmount - (this.discountAmount || 0);
});

// 🔹 Ownership check method
orderSchema.methods.isOwnedBy = function (userId) {
  return this.customer.toString() === userId.toString();
};

// 🔹 Indexes for performance
orderSchema.index({ customer: 1 });
orderSchema.index({ 'products.vendor': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ deleted: 1 });

orderSchema.plugin(normalizeMongoose);

export default orderSchema;
