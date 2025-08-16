import Admin from '../Models/adminModel.js';
import User from '../Models/userModel.js';
import Product from '../Models/productModel.js';
import Order from '../Models/orderModel.js';
import { deleteFromCloudinary } from '../Utils/cloudinary.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerAdminSchema, loginAdminSchema } from '../Utils/adminValidation.js';

const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ======================== AUTH ========================


// @desc    Register new admin
// @route   POST /api/admin/auth/register
export const registerAdmin = async (req, res) => {
  const { error } = registerAdminSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((err) => err.message)
    });
  }

  const { name, email, password, adminSecret } = req.body;

  // ✅ NEW: Validate admin secret key
  if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: 'Invalid admin secret key' });
  }

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });
    const { _id, ...adminResponse } = admin.toObject();

    res.status(201).json({
      ...adminResponse,
      id: _id,
      token: generateToken(admin._id, 'admin'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
export const loginAdmin = async (req, res) => {
  const { error } = loginAdminSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((err) => err.message)
    });
  }

  const { email, password, adminSecret } = req.body;

  // ✅ NEW: Validate admin secret key
  if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: 'Invalid admin secret key' });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id, 'admin');

    res.status(200).json({
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};


// ======================== DASHBOARD ========================

// @desc    Get a comprehensive admin dashboard summary
// @route   GET /api/admin/dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user._id;
    const adminName = req.user.name;

    const adminProducts = await Product.find({ user: adminId });

    const totalUsers = await User.countDocuments({ role: { $in: ['vendor', 'customer'] } });

    const brandOrders = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $match: {
          'productDetails.category': { $in: ["Shea Shine Cosmetics", "D'Sung Vegetable Products"] }
        }
      },
      {
        $group: {
          _id: '$productDetails.category',
          orders: { $push: '$$ROOT' }
        }
      }
    ]);

    res.status(200).json({
      welcomeMessage: `Welcome, Admin ${adminName}`,
      adminDashboard: {
        myProducts: adminProducts,
        totalUsers: totalUsers,
        brandOrders: brandOrders,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ======================== USERS ========================

// @desc    Get all users, separated by role and with counts
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    const totalVendors = vendors.length;

    const customers = await User.find({ role: 'customer' }).select('-password');
    const totalCustomers = customers.length;

    res.status(200).json({
      totalVendors,
      totalCustomers,
      vendors,
      customers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.remove();
    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ======================== STATS ========================

// @desc    Get system stats
// @route   GET /api/admin/stats
export const getSystemStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalUsers = totalCustomers + totalVendors;

    const totalProducts = await Product.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalOrders = await Order.countDocuments();

    const paidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

    const pendingDeliveries = await Order.countDocuments({ isDelivered: false });

    res.status(200).json({
      totalUsers,
      totalCustomers,
      totalVendors,
      totalProducts,
      totalAdmins,
      totalOrders,
      totalRevenue,
      pendingDeliveries,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ======================== PRODUCTS ========================

// @desc    Create product as admin
// @route   POST /api/admin/products
export const createAdminProduct = async (req, res) => {
  try {
    const { title, price, description, category, businessName, images } = req.body;
    const user = req.user._id;
    const vendorName = req.user.name;

    const product = await Product.create({
      title,
      price,
      description,
      category,
      businessName,
      user,
      vendorName,
      images
    });

    const { _id, ...productResponse } = product.toObject();
    res.status(201).json({
      ...productResponse,
      id: _id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, description, category, businessName, images } = req.body;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (images && images.length > 0) {
      const deletePromises = product.images.map(img => deleteFromCloudinary(img.public_id));
      await Promise.all(deletePromises);
      
      product.images = images;
    }

    product.title = title || product.title;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.businessName = businessName || product.businessName;

    const updatedProduct = await product.save();
    const { _id, ...productResponse } = updatedProduct.toObject();
    res.status(200).json({
      ...productResponse,
      id: _id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const deletePromises = product.images.map(img => deleteFromCloudinary(img.public_id));
    await Promise.all(deletePromises);

    await product.remove();

    res.status(200).json({ message: 'Product removed' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ ✅ ✅ NEW: Get all products created by the admin
// @route   GET /api/admin/products
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ ✅ ✅ NEW: Get a single product by ID
// @route   GET /api/admin/products/:id
export const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ======================== EXTRA ========================

export const adminController = (req, res) => {
  res.json({ message: 'Admin restricted route accessed.' });
};
