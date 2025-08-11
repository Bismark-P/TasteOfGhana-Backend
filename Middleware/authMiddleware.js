// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import Admin from '../Models/adminModel.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ CORRECTED: Use decoded.userId instead of decoded.id
      let account = await Admin.findById(decoded.userId).select('-password');

      // If not admin, check Users
      if (!account) {
        // ✅ CORRECTED: Use decoded.userId instead of decoded.id
        account = await User.findById(decoded.userId).select('-password');
      }

      if (!account) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = account;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};



// // middleware/authMiddleware.js
// import jwt from 'jsonwebtoken';
// import User from '../Models/userModel.js';
// import Admin from '../Models/adminModel.js';

// export const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization?.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // First check Admins
//       let account = await Admin.findById(decoded.id).select('-password');

//       // If not admin, check Users
//       if (!account) {
//         account = await User.findById(decoded.id).select('-password');
//       }

//       if (!account) {
//         return res.status(401).json({ message: 'Not authorized, user not found' });
//       }

//       req.user = account;
//       next();
//     } catch (err) {
//       console.error(err);
//       return res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   } else {
//     return res.status(401).json({ message: 'No token, authorization denied' });
//   }
// };

// export const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Access denied: insufficient permissions' });
//     }
//     next();
//   };
// };
