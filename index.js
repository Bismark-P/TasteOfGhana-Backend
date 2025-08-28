import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Routes
import authRoutes from './Routes/authRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import productRoutes from './Routes/productRoutes.js';
import orderRoutes from './Routes/orderRoutes.js';
import uploadRoutes from './Routes/uploadRoutes.js';

// ✅ Newly added routes (matching your UI needs)
import paymentsRoutes from './Routes/paymentsRoutes.js';
import blogRoutes from './Routes/blogRoutes.js';
import reviewsRoutes from './Routes/reviewsRoutes.js';
import announcementsRoutes from './Routes/announcementsRoutes.js';
import settingsRoutes from './Routes/settingsRoutes.js';
import notificationsRoutes from './Routes/notificationsRoutes.js';
// import dashboardRoutes from './Routes/dashboardRoutes.js'; // ⬅️ Only if you decide later to separate dashboard logic

// App setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// ✅ Newly added routes
app.use('/api/payments', paymentsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
// app.use('/api/dashboard', dashboardRoutes); // ⬅️ Uncomment if dashboard gets separated later

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Taste of North Ghana API is running...',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

connectDB();
