// Controllers/productController.js
import Product from '../Models/productModel.js';
import { uploadToCloudinary } from '../Utils/cloudinary.js';
import fs from 'fs';

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      vendorName,
      businessName,
    } = req.body;

    const images = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        images.push({ url: result.secure_url, public_id: result.public_id });
        fs.unlinkSync(file.path);
      }
    }

    const product = new Product({
      title,
      description,
      category,
      price,
      vendorName: vendorName?.toLowerCase(),
      businessName: businessName?.toLowerCase(),
      images,
      user: req.user._id,
    });

    await product.save();
    res.status(201).json({ message: 'Product created.', product });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product.', error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const {
      category,
      vendor,
      business,
      search,
      priceMin,
      priceMax,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const query = { deleted: { $ne: true } };

    if (category) query.category = category;
    if (vendor) query.vendorName = vendor.toLowerCase();
    if (business) query.businessName = business.toLowerCase();
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = {};
    if (sort === 'popularity') sortOption.popularity = -1;
    else if (sort === 'new') sortOption.createdAt = -1;
    else if (sort === 'priceAsc') sortOption.price = 1;
    else if (sort === 'priceDesc') sortOption.price = -1;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products.', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product.', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Ownership check
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own products.' });
    }

    const updates = {
      ...req.body,
      vendorName: req.body.vendorName?.toLowerCase(),
      businessName: req.body.businessName?.toLowerCase(),
    };

    if (req.files?.length) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.path);
        newImages.push({ url: result.secure_url, public_id: result.public_id });
        fs.unlinkSync(file.path);
      }
      updates.images = newImages;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ message: 'Product updated.', product: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product.', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.deleted) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Ownership check
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own products.' });
    }

    await Product.findByIdAndUpdate(req.params.id, { deleted: true });
    res.status(200).json({ message: 'Product marked as deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.', error: error.message });
  }
};
