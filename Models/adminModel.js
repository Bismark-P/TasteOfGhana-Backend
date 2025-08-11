import mongoose from 'mongoose';
import adminSchema from '../Schemas/adminSchema.js';

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
