import Admin from '../Models/adminModel.js';
import User from '../Models/userModel.js';
import Product from '../Models/productModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const { JWT_SECRET, ADMIN_SECRET_KEY } = process.env;

// Generate JWT for admin
const generateAdminToken = (admin) => {
  return jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Simple restricted test controller
export const adminController = (req, res) => {
  res.json({ message: 'Admin route accessed successfully' });
};

// ✅ Register admin with password hashing
export const registerAdmin = async (req, res) => {
  try {
    let { name, email, password, confirmPassword, secretKey } = req.body;
    email = email.toLowerCase().trim();

    if (!name || !email || !password || !confirmPassword || !secretKey) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (secretKey !== ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists.' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword
    });

    await newAdmin.save();

    const token = generateAdminToken(newAdmin);
    res.status(201).json({
      message: 'Admin registered successfully.',
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ Login admin
export const loginAdmin = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = generateAdminToken(admin);
    res.status(200).json({
      message: 'Login successful.',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ Dashboard summary
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    res.status(200).json({
      summary: {
        totalUsers,
        totalVendors,
        totalCustomers,
        brands: ['Di Sung', 'Shea Shine Cosmetics']
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Dashboard error.', error: error.message });
  }
};

// ✅ Get all users (excluding password)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users.', error: error.message });
  }
};

// ✅ Delete user by ID
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user.', error: error.message });
  }
};

// ✅ System stats
export const getSystemStats = async (req, res) => {
  try {
    res.status(200).json({
      stats: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats.', error: error.message });
  }
};

// ✅ Create product for allowed brands
export const createAdminProduct = async (req, res) => {
  try {
    let {
      title,
      images,
      description,
      vendorName,
      businessName,
      category,
      price
    } = req.body;

    vendorName = vendorName?.toLowerCase();
    businessName = businessName?.toLowerCase();

    const allowedBrands = ['di sung', 'shea shine cosmetics'];
    if (!allowedBrands.includes(businessName)) {
      return res.status(403).json({
        message: 'Admin can only upload for Di Sung or Shea Shine Cosmetics.'
      });
    }

    if (!title || !images || !description || !vendorName || !businessName || !category || !price) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const product = new Product({
      title,
      images,
      description,
      vendorName,
      businessName,
      category,
      price
    });

    await product.save();
    res.status(201).json({ message: 'Product uploaded by admin.', product });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading product.', error: error.message });
  }
};
