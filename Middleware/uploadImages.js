import { uploadToCloudinary } from '../Utils/cloudinary.js';
import fs from 'fs';

const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.body.images = [];
      return next();
    }

    const uploadPromises = req.files.map(async file => {
      const result = await uploadToCloudinary(file.path, req.body.category || 'products');
      fs.unlinkSync(file.path);
      return { url: result.url, public_id: result.public_id };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    req.body.images = uploadedImages;

    next();
  } catch (err) {
    console.error(err);
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
};

export default uploadProductImages;