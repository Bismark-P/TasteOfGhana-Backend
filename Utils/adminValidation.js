// // Utils/adminValidation.js
import Joi from 'joi';

export const registerAdminSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must not exceed 100 characters'
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required'
  }),
  adminSecret: Joi.string().required().messages({
    'string.empty': 'Admin secret is required'
  }) // ✅ NEW
});

export const loginAdminSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  }),
  // adminSecret: Joi.string().required().messages({
  //   'string.empty': 'Admin secret is required'
  // }) // ✅ NEW
});





