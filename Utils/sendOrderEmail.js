// Utils/sendOrderEmail.js
import nodemailer from 'nodemailer';
import User from '../Models/userModel.js';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use 'SendGrid', 'Outlook', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendOrderEmail = async (userId, order) => {
  const user = await User.findById(userId);
  if (!user || !user.email) return;

  const summary = order.items.map(item =>
    `${item.quantity} x ${item.product.name} @ GHS${item.price}`
  ).join('\n');

  const mailOptions = {
    from: `"Your Store" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Order Confirmation',
    text: `
Hi ${user.name},

Thanks for your order! 🎉

Order Summary:
${summary}

Subtotal: GHS¢{order.subtotal}
Shipping: GHS¢{order.shippingFee}
Tax: GHS¢{order.tax}
Total: GHS¢{order.total}

We'll notify you once your order is on its way.

Cheers,
The Team
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order email sent to ${user.email}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

export default sendOrderEmail;
