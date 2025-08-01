import mongoose from 'mongoose';
import ProductSchema from '../Schemas/productSchema.js';

const Product = mongoose.model('Product', ProductSchema);
export default Product;
