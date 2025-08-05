import Product from '../Models/productModel.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "Name, description, price, and category are required" });
    }

    const vendor = req.user?._id;
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Vendor authentication failed' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product image is required" });
    }

    const images = req.files.map(file => file.path);

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
    console.error('Create Product Error:', err);
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
