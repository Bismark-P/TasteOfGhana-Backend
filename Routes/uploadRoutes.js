// Routes/uploadRoutes.js
import express from 'express';
import upload from '../Middleware/multer.js';
import { uploadToCloudinary } from '../Utils/cloudinary.js';
import fs from 'fs';

const router = express.Router();

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.path, req.body.folder || 'products');

    // Clean up local file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: 'Upload successful',
      url: result.url,
      public_id: result.public_id
    });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;
