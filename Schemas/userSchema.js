import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import normalizeMongoose from 'normalize-mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'vendor'],
      required: true,
      lowercase: true,
      default: 'customer'
    },
    businessName: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      }
    }
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.plugin(normalizeMongoose, {
  doNormalize: true,
  normalizeId: true,
  normalizeTimestamp: false,
});

export default userSchema;