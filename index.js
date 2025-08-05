import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './Routes/authRoutes.js';
import dashboardRoutes from './Routes/dashboardRoutes.js';
import productRoutes from './Routes/productRoutes.js';
import adminRoutes from './Routes/adminRoutes.js'; 
import adminAuthRoutes from './Routes/adminAuthRoutes.js'; // ✅ NEW

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mount routes
app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', productRoutes);
app.use('/api', adminRoutes);
app.use('/api', adminAuthRoutes); // ✅ NEW

// ✅ Global error handler for Multer/Cloudinary
app.use((err, req, res, next) => {
  console.error('Upload error:', err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5050;

// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("Mongo error:", err));
