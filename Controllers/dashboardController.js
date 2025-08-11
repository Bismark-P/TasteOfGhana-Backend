// Controllers/dashboardController.js
import User from '../Models/userModel.js';
import Product from '../Models/productModel.js';
import Order from '../Models/orderModel.js';

export const getDashboard = async (req, res) => {
  try {
    const { role, id, name } = req.user;

    switch (role) {
      // ---------- ADMIN DASHBOARD ----------
      case 'admin': {
        const totalUsers = await User.countDocuments();
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });

        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        return res.json({
          welcomeMessage: `Welcome, Admin ${name}`,
          summary: "Admin dashboard summary data",
          stats: {
            users: {
              total: totalUsers,
              vendors: totalVendors,
              customers: totalCustomers
            },
            products: {
              total: totalProducts
            },
            orders: {
              total: totalOrders,
              pending: pendingOrders
            }
          }
        });
      }

      // ---------- VENDOR DASHBOARD ----------
      case 'vendor': {
        const totalVendorProducts = await Product.countDocuments({ vendor: id });
        const vendorOrders = await Order.countDocuments({ vendor: id });
        const vendorPendingOrders = await Order.countDocuments({ vendor: id, status: 'pending' });

        return res.json({
          welcomeMessage: `Welcome, Vendor ${name}`, // ✅ Added welcome message
          summary: "Vendor dashboard with product stats",
          stats: {
            products: {
              total: totalVendorProducts
            },
            orders: {
              total: vendorOrders,
              pending: vendorPendingOrders
            }
          }
        });
      }

      // ---------- CUSTOMER DASHBOARD ----------
      case 'user': // The user role is 'user' not 'customer' in your code
      case 'customer': {
        const customerOrders = await Order.find({ customer: id })
          .sort({ createdAt: -1 })
          .limit(5);

        return res.json({
          welcomeMessage: `Welcome, ${name}`, // ✅ Added welcome message
          summary: "Customer dashboard with order history",
          recentOrders: customerOrders
        });
      }

      default:
        return res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};