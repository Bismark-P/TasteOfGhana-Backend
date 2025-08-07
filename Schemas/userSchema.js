import mongoose from 'mongoose';
import normalize from 'normalize-mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['customer', 'vendor'], // ✅ Removed "Admin" here
    default: 'customer'
  }
}, { timestamps: true });

userSchema.plugin(normalize);

export default userSchema;



// import mongoose from 'mongoose';
// import normalize from 'normalize-mongoose';

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['admin', 'vendor', 'customer'], default: 'customer' },
// }, { timestamps: true });

// UserSchema.plugin(normalize);
// export default UserSchema;
