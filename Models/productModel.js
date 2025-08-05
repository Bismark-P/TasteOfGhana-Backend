import mongoose from 'mongoose';
import productSchema from '../Schemas/productSchema.js'; // ✅ Import schema

// ✅ Compile schema into a model
const Product = mongoose.model('Product', productSchema);

export default Product;
