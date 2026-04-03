import Joi from "joi";

// ================= REGISTER =================
export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});


// ================= LOGIN =================
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


// ================= FORGOT PASSWORD =================
export const forgotSchema = Joi.object({
  email: Joi.string().email().required(),
});


// ================= VERIFY OTP =================
export const otpSchema = Joi.object({
  otp: Joi.string().length(6).required(),
});


// ================= CHANGE PASSWORD =================
export const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
});