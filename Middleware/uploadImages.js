import { uploadToCloudinary } from '../Utils/cloudinary.js';

const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.body.images = [];
      return next();
    }

    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, req.body.category || 'products')
    );

    const uploadedImages = await Promise.all(uploadPromises);
    req.body.images = uploadedImages;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
};

export default uploadProductImages;
