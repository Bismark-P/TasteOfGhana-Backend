import Product from '../Models/productModel.js';

// Create product
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product created.', product });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product.', error: error.message });
  }
};

// Get all products with filters/sorting
export const getProducts = async (req, res) => {
  try {
    const { category, vendor, business, search, priceMin, priceMax, sort } = req.query;

    let query = {};

    if (category) query.category = category;
    if (vendor) query.vendorName = vendor.toLowerCase();
    if (business) query.businessName = business.toLowerCase();
    if (search) query.description = { $regex: search, $options: 'i' };
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    let sortOption = {};
    if (sort === 'popularity') sortOption.popularity = -1;
    else if (sort === 'new') sortOption.createdAt = -1;
    else if (sort === 'priceAsc') sortOption.price = 1;
    else if (sort === 'priceDesc') sortOption.price = -1;

    const products = await Product.find(query).sort(sortOption);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.', error: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product.', error: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'Product updated.', product: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product.', error: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.', error: error.message });
  }
};
