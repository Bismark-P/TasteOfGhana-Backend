// Controllers/adminController.js
import Admin from '../Models/adminModel.js';
import User from '../Models/userModel.js';
import Product from '../Models/productModel.js';
import jwt from 'jsonwebtoken';

const { JWT_SECRET, ADMIN_SECRET_KEY } = process.env;

// Generate JWT for admin
const generateAdminToken = (admin) => {
  return jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Public test route
export const adminController = (req, res) => {
  res.json({ message: 'Admin route accessed successfully' });
};

// ✅ Register admin
export const registerAdmin = async (req, res) => {
  try {
    let { name, email, password, confirmPassword, secretKey } = req.body;

    // Normalize email
    email = email.toLowerCase().trim();

    // Validate required fields
    if (!name || !email || !password || !confirmPassword || !secretKey) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Admin secret key check
    if (secretKey !== ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key.' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists.' });
    }

    // Create new admin (password hashing is handled in schema pre-save)
    const newAdmin = new Admin({
      name,
      email,
      password
    });

    await newAdmin.save();

    // Generate token
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
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

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

// ✅ Admin dashboard example
export const getAdminDashboard = (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
};

// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ Get system stats
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalAdmins = await Admin.countDocuments();

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalAdmins
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ Create product as admin
export const createAdminProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    const product = new Product({
      name,
      price,
      description,
      createdBy: req.user.id
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
