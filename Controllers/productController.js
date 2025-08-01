import Product from '../Models/productModel.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const vendor = req.user.id;

    const images = req.files?.map(file => file.path) || [];

    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images,
      vendor
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('vendor', 'name email');
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
