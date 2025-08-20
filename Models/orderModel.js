import mongoose from 'mongoose';
import orderSchema from '../Schemas/orderSchema.js';

const Order = mongoose.model('Order', orderSchema);
export default Order;
