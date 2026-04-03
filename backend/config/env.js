import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.SECRET_KEY,

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  NODE_ENV: process.env.NODE_ENV || "development",
};

// basic check (important 🔥)
if (!ENV.MONGO_URI || !ENV.JWT_SECRET) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}