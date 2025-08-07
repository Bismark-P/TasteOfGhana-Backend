import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must not exceed 100 characters'
  }),
  email: Joi.string()
    .trim()
    .lowercase() // ✅ automatically lowercases
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required'
  }),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Confirm password is required'
  }),
  role: Joi.string()
    .valid('Customer', 'Vendor')
    .insensitive()
    .required()
    .messages({
      'any.only': 'Role must be either Customer or Vendor',
      'string.empty': 'Role is required'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase() // ✅ automatically lowercases
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'string.empty': 'Email is required'
    }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});
