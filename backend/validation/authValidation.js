import Joi from "joi";

// No SQL/NoSQL injection chars allowed in name
const namePattern = /^[a-zA-Z\s'-]+$/;

// Strong password:
// - min 6 chars
// - at least one uppercase letter
// - at least one lowercase letter
// - at least one number
// - at least one special character
// - not a common weak password
const WEAK_PASSWORDS = ["password", "123456", "password1", "qwerty", "abc123", "letmein", "welcome", "monkey", "dragon", "master"];

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

//  REGISTER 
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(3).max(50)
    .pattern(namePattern)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens and apostrophes',
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name cannot exceed 50 characters',
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100)
    .lowercase()
    .required()
    .messages({
      'string.email': 'Email must contain @ symbol and be a valid email address',
      'string.empty': 'Email is required',
    }),

  password: Joi.string()
    .min(6).max(128)
    .pattern(passwordPattern)
    .required()
    .custom((value, helpers) => {
      if (WEAK_PASSWORDS.includes(value.toLowerCase())) {
        return helpers.error('password.weak');
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, a number, and a special character',
      'string.min': 'Password must be at least 6 characters',
      'password.weak': 'Password is too common. Please choose a stronger password',
    }),
});

// LOGIN 
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100)
    .lowercase()
    .required()
    .messages({
      'string.email': 'Email must contain @ symbol and be a valid email address',
      'string.empty': 'Email is required',
    }),

  password: Joi.string()
    .min(1).max(128)
    .required()
    .messages({ 'string.empty': 'Password is required' }),
});

// FORGOT PASSWORD 
export const forgotSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100)
    .lowercase()
    .required()
    .messages({
      'string.email': 'Email must contain @ symbol and be a valid email address',
      'string.empty': 'Email is required',
    }),
});

//VERIFY OTP 
export const otpSchema = Joi.object({
  otp: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only digits',
    }),
});

// CHANGE PASSWORD 
export const changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(6).max(128)
    .pattern(passwordPattern)
    .required()
    .custom((value, helpers) => {
      if (WEAK_PASSWORDS.includes(value.toLowerCase())) {
        return helpers.error('password.weak');
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, a number, and a special character',
      'string.min': 'Password must be at least 6 characters',
      'password.weak': 'Password is too common. Please choose a stronger password',
    }),
});
