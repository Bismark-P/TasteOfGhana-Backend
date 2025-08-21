import Order from '../Models/orderModel.js';

// Create Order (any authenticated user can order)
export const createOrder = async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      customer: req.user._id // whoever is placing the order
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Orders (scoped by role)
export const getOrders = async (req, res) => {
  try {
    let query = { deleted: false };

    if (req.user.role === 'vendor') {
      query['products.vendor'] = req.user._id; // assumes vendor is stored per product
    } else if (req.user.role === 'customer') {
      query.customer = req.user._id;
    }

    const orders = await Order.find(query).populate('customer products.product');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Order (scoped by role)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer products.product');
    if (!order || order.deleted) return res.status(404).json({ error: 'Order not found' });

    const isCustomer = order.customer.equals(req.user._id);
    const isVendor = order.products.some(p => p.vendor.equals(req.user._id));
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Order Status (vendors only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order || order.deleted) return res.status(404).json({ error: 'Order not found' });

    const isVendor = order.products.some(p => p.vendor.equals(req.user._id));
    if (!isVendor && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only vendors or admins can update status' });
    }

    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft Delete (owner or admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.deleted) return res.status(404).json({ error: 'Order not found' });

    const isOwner = order.customer.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only owner or admin can delete' });
    }

    order.deleted = true;
    order.deletedBy = req.user._id;
    order.deletedAt = new Date();
    await order.save();

    res.status(200).json({ message: 'Order deleted', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Paystack Webhook Handler
export const paystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const order = await Order.findOne({ paymentReference: reference });

      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();
      }
    }

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
