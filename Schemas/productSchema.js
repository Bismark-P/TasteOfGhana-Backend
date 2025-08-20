import mongoose from 'mongoose';
import normalizeMongoose from 'normalize-mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    description: { type: String, required: true },
    vendorName: { type: String, required: true, lowercase: true, trim: true },
    businessName: { type: String, lowercase: true, trim: true },
    category: {
      type: String,
      enum: [
        'Shea Shine Cosmetics',
        "D'Sung Vegetable Products",
        'Food & Spices',
        'Health & Wellness',
        'Textiles & Crafts',
        'Other',
      ],
      required: true,
    },
    price: { type: Number, required: true },
    reviews: { type: [String], default: [] },
    popularity: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

productSchema.plugin(normalizeMongoose, {
  doNormalize: true,
  normalizeId: true,
  normalizeTimestamp: false,
});

export default productSchema;
