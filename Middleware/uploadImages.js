// Middleware/uploadImages.js
import { uploadToCloudinary } from '../Utils/cloudinary.js';
import fs from 'fs';

// This middleware handles an array of files uploaded via Multer
const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      // No files were uploaded, proceed without images
      req.body.images = [];
      return next();
    }

    const uploadPromises = req.files.map(file => uploadToCloudinary(file.path, 'products'));

    const results = await Promise.all(uploadPromises);

    // Get the URLs and clean up local files
    req.body.images = results.map(result => {
      fs.unlinkSync(req.files.find(file => file.path.endsWith(result.public_id)).path);
      return result.url;
    });

    next();
  } catch (err) {
    console.error(err);
    // Clean up any remaining local files in case of error
    if (req.files) {
      req.files.forEach(file => fs.unlinkSync(file.path));
    }
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
};

export default uploadProductImages;