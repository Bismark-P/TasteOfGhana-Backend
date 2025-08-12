// Schemas/productSchema.js
import mongoose from 'mongoose';
import normalizeMongoose from 'normalize-mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    description: {
      type: String,
      required: true
    },
    vendorName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    businessName: {
      type: String,
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      enum: [
        'Shea Shine Cosmetics',
        "D'Sung Vegetable Products",
        'Food & Spices',
        'Health & Wellness',
        'Textiles & Crafts',
        'Other'
      ],
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    reviews: {
      type: [String],
      default: []
    },
    popularity: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    // ✅ UPDATED: Add toJSON options to the schema
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

productSchema.plugin(normalizeMongoose, {
  doNormalize: true,
  normalizeId: true,
  normalizeTimestamp: false,
});

export default productSchema;