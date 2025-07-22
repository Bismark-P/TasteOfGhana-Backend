import mongoose from 'mongoose';
import UserSchema from '../Schemas/userSchema.js';

const User = mongoose.model('User', UserSchema);
export default User;