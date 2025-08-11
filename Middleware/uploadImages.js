// Middleware/uploadImages.js
import { uploadToCloudinary } from '../Utils/cloudinary.js';
import fs from 'fs';

const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      // If no files were uploaded, proceed without images
      req.body.images = [];
      return next();
    }

    const uploadPromises = req.files.map(async file => {
      const result = await uploadToCloudinary(file.path, req.body.category || 'products');
      // Clean up the local file immediately after upload
      fs.unlinkSync(file.path);
      return result.url;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    // Attach the array of URLs to the request body
    req.body.images = uploadedUrls;

    next();
  } catch (err) {
    console.error(err);
    // Clean up any remaining local files in case of error
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