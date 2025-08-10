import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  images: {
    type: [String],
    required: true
  },
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default productSchema;
