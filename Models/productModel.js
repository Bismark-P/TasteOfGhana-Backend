// productModel
import mongoose from 'mongoose';
import productSchema from '../Schemas/productSchema.js';

const Product = mongoose.model('Product', productSchema);

export default Product;
