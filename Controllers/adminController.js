// At the top
import Admin from '../Models/adminModel.js';
import Product from '../Models/productModel.js';
import User from '../Models/userModel.js';

// ✅ View all vendor products with vendor details
export const getAllVendorProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendor', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    console.error("Admin Get Products Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ View all registered users except Admins
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'Admin' } }).select('-password');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    console.error("Admin Get Users Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete a vendor product
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Admin Delete Product Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Dashboard summary (users, vendors, products count)
export const getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'Customer' });
    const totalVendors = await User.countDocuments({ role: 'Vendor' });
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      success: true,
      summary: {
        totalUsers,
        totalVendors,
        totalProducts
      }
    });
  } catch (err) {
    console.error("Admin Dashboard Summary Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🆕 Membership Summary (Vendors, Customers, Total Membership)
export const getMembershipSummary = async (req, res) => {
  try {
    const vendorsCount = await User.countDocuments({ role: 'Vendor' });
    const customersCount = await User.countDocuments({ role: 'Customer' });
    const totalUsers = vendorsCount + customersCount;

    res.status(200).json({
      success: true,
      summary: {
        vendors: vendorsCount,
        customers: customersCount,
        totalMembership: totalUsers
      }
    });
  } catch (err) {
    console.error("Admin Membership Summary Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
