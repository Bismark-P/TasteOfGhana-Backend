// models/OrderModel.js
import mongoose from 'mongoose';
import OrderSchema from '../Schemas/orderSchema.js';

const Order = mongoose.model('Order', OrderSchema);
export default Order;
