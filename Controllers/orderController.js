import Order from '../Models/orderModel.js';

// Create Order
export const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deleted: false }).populate('customer products.product');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer products.product');
    if (!order || order.deleted) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft Delete
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, {
      deleted: true,
      deletedBy: req.user._id,
      deletedAt: new Date()
    }, { new: true });
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
