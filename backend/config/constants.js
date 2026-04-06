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

// Cutoff times (24h, server local time)
// Set to 23:59 for testing — revert to real times for production
export const CUTOFF_TIMES = {
  breakfast: { hour: 23, minute: 59 },
  lunch:     { hour: 23, minute: 59 },
  dinner:    { hour: 23, minute: 59 },
};

// Cost per meal in ₹
export const MEAL_COSTS = {
  breakfast: 30,
  lunch:     50,
  dinner:    40,
};
