
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Models/userModel.js';
import { registerSchema, loginSchema } from '../Schemas/authSchema.js';
import sendEmail from '../Utils/sendEmail.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Allowed roles for user registration
const allowedRoles = ['customer', 'vendor'];

// REGISTER: USER or VENDOR
export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, confirmPassword, role } = req.body;

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Optional: Send welcome email
    await sendEmail(
      email,
      'Welcome to the Platform!',
      `Hello ${name},\n\nThank you for registering as a ${role} on Taste of North Ghana.\n\n- The Team`
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token: generateToken(newUser._id, newUser.role),
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// LOGIN: USER or VENDOR
export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};


// // import dotenv from 'dotenv';
// // dotenv.config();

// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import User from '../Models/userModel.js';
// import sendEmail from '../Utils/sendEmail.js';

// const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';

// // ====================== REGISTER ======================
// export const register = async (req, res) => {
//   try {
//     const { name, email, password, confirmPassword, role } = req.body;

//     console.log('📥 Registration attempt:', { name, email, role });

//     // ✅ Validate input
//     if (!name || !email || !password || !confirmPassword || !role) {
//       console.log('⚠️ Missing required fields.');
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     if (password !== confirmPassword) {
//       console.log('⚠️ Passwords do not match.');
//       return res.status(400).json({ message: "Passwords do not match." });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) {
//       console.log('⚠️ Email already exists:', email);
//       return res.status(400).json({ message: "Email already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role
//     });

//     console.log('✅ User created:', newUser.email);

//     // ✅ Send welcome email
//     try {
//       console.log('📤 Sending welcome email to:', email);

//       const emailInfo = await sendEmail({
//         to: email,
//         subject: 'Welcome to Taste of North Ghana!',
//         text: `Hi ${name}, welcome aboard as a ${role}!`,
//         html: `
//           <div style="font-family: Arial, sans-serif; line-height: 1.5;">
//             <h2>Welcome, ${name}!</h2>
//             <p>We’re excited to have you join us as a <strong>${role}</strong>.</p>
//             <p>Get started by exploring our marketplace and connecting with customers.</p>
//             <br>
//             <p style="color: #888;">Taste of North Ghana Team</p>
//           </div>
//         `
//       });

//       console.log('✅ Email sent:', {
//         messageId: emailInfo?.messageId,
//         accepted: emailInfo?.accepted,
//         response: emailInfo?.response
//       });

//     } catch (emailErr) {
//       console.error('❌ Error sending welcome email:', emailErr.message);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Registered successfully. Welcome email sent.",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role
//       }
//     });

//   } catch (err) {
//     console.error('❌ Register Error:', err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ====================== LOGIN ======================
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     console.log('🔐 Login attempt:', email);

//     if (!email || !password) {
//       console.log('⚠️ Missing login credentials.');
//       return res.status(400).json({ message: "Email and password are required." });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log('❌ User not found.');
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       console.log('❌ Password mismatch.');
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

//     console.log('✅ Login successful:', user.email);

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         role: user.role
//       }
//     });

//   } catch (err) {
//     console.error('❌ Login Error:', err);
//     res.status(500).json({ message: "Login error", error: err.message });
//   }
// };
