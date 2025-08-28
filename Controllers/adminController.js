// adminController.js

import Admin from '../Models/adminModel.js';
import User from '../Models/userModel.js';
import Product from '../Models/productModel.js';
import Order from '../Models/orderModel.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../Utils/cloudinary.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerAdminSchema, loginAdminSchema } from '../Utils/adminValidation.js';

// NOTE: You will need these models for the new sections below
// import Payment from '../Models/paymentModel.js';
// import Blog from '../Models/blogModel.js';
// import Review from '../Models/reviewModel.js';
// import Announcement from '../Models/announcementModel.js';
// import SiteSettings from '../Models/siteSettingsModel.js';

// Token Generator
const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ----------------- AUTH -----------------
export const registerAdmin = async (req, res) => {
  const { error } = registerAdminSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((err) => err.message)
    });
  }

  const { name, email, password, adminSecret } = req.body;

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

export const loginAdmin = async (req, res) => {
  const { error } = loginAdminSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((err) => err.message)
    });
  }

  const { email, password} = req.body;

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

// ----------------- DASHBOARD -----------------
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
        totalUsers,
        brandOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ----------------- USERS -----------------
export const getAllUsers = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-password');
    const customers = await User.find({ role: 'customer' }).select('-password');

    res.status(200).json({
      totalVendors: vendors.length,
      totalCustomers: customers.length,
      vendors,
      customers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

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

// ----------------- STATS -----------------
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

// ----------------- PRODUCTS -----------------
export const createAdminProduct = async (req, res) => {
  try {
    const { title, price, description, category, businessName } = req.body;
    const user = req.user._id;
    const vendorName = req.user.name;

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer))
      );
    }

    const product = await Product.create({
      title,
      price,
      description,
      category,
      businessName,
      user,
      vendorName,
      images: uploadedImages
    });

    const { _id, ...productResponse } = product.toObject();
    res.status(201).json({
      ...productResponse,
      id: _id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { title, price, description, category, businessName } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.files && req.files.length > 0) {
      const deletePromises = product.images.map(img => deleteFromCloudinary(img.public_id));
      await Promise.all(deletePromises);

      const uploadedImages = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer))
      );

      product.images = uploadedImages;
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
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const deletePromises = product.images.map(img => deleteFromCloudinary(img.public_id));
    await Promise.all(deletePromises);

    await product.remove();
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

export const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or access denied' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ----------------- NEW SECTIONS -----------------
// ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status || order.status;
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// PAYMENTS
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user", "name email");
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("user", "name email");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// BLOG POSTS
export const createBlogPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = await Blog.create({ title, content, author: req.user._id });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateBlogPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog post not found" });

    blog.title = title || blog.title;
    blog.content = content || blog.content;

    const updatedBlog = await blog.save();
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const deleteBlogPost = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog post not found" });

    await blog.remove();
    res.status(200).json({ message: "Blog post removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getAllBlogPosts = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name email");
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// REVIEWS
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user", "name email");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.remove();
    res.status(200).json({ message: "Review removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ANNOUNCEMENTS
export const createAnnouncement = async (req, res) => {
  try {
    const { message } = req.body;
    const announcement = await Announcement.create({ message, createdBy: req.user._id });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().populate("createdBy", "name email");
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    await announcement.remove();
    res.status(200).json({ message: "Announcement removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// SITE SETTINGS
export const getSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { siteName, contactEmail } = req.body;
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({ siteName, contactEmail });
    } else {
      settings.siteName = siteName || settings.siteName;
      settings.contactEmail = contactEmail || settings.contactEmail;
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ----------------- EXTRA -----------------
export const adminController = (req, res) => {
  res.json({ message: 'Admin restricted route accessed.' });
};
