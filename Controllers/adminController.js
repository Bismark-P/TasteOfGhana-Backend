// Controllers/adminController.js
import Admin from '../Models/adminModel.js';
import User from '../Models/userModel.js';
import Product from '../Models/productModel.js';
import Order from '../Models/orderModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ✅ Corrected: Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ======================== AUTH ========================

// @desc    Register new admin
// @route   POST /api/admin/auth/register
export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      token: generateToken(admin._id, 'admin'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
      token: generateToken(admin._id, 'admin'),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ======================== DASHBOARD ========================

// @desc    Get a comprehensive admin dashboard summary
// @route   GET /api/admin/dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user._id;
    const adminName = req.user.name;

    // Get admin's products
    const adminProducts = await Product.find({ user: adminId });

    // Get total users
    const totalUsers = await User.countDocuments({ role: { $in: ['vendor', 'customer'] } });

    // Get orders for specific brands
    const brandOrders = await Order.aggregate([
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
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

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
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

// @desc    Get system stats
// @route   GET /api/admin/stats
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

// @desc    Create product as admin
// @route   POST /api/admin/products
export const createAdminProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const user = req.user._id;
    const vendorName = req.user.name;

    const product = await Product.create({
      name,
      price,
      description,
      category,
      user,
      vendorName
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ======================== EXTRA ========================

export const adminController = (req, res) => {
  res.json({ message: 'Admin restricted route accessed.' });
};