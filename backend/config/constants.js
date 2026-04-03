export const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  MESS_MANAGER: "mess_manager",
};

export const TOKEN_EXPIRY = {
  ACCESS: "10d",
  REFRESH: "30d",
  EMAIL_VERIFY: "10m",
};

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
};

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"];