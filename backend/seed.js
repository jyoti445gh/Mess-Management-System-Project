import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/userModel.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mess_management";

const users = [
  //{ name: "Admin User",   email: "admin@mess.com",   password: "admin123",   role: "admin" },
  { name: "Mess Manager", email: "manager@mess.com", password: "manager123", role: "mess_manager" },
  //{ name: "Student One",  email: "student@mess.com", password: "student123", role: "student" },
];

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(` Already exists: ${u.email}`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed, isVerified: true });
    console.log(`✅ Created: ${u.email} (${u.role})`);
  }

  console.log("\n── Login Credentials ──────────────────");
  // console.log("Admin:   admin@mess.com    / admin123");
  console.log("Manager: manager@mess.com  / manager123");
  console.log("Student: student@mess.com  / student123");
  console.log("────────────────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });


// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import dotenv from "dotenv";
// dotenv.config();

// import Meal from "./models/mealModel.js";
// import connectDB from "./config/db.js";

// const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mess_management";

// const meals = [
//   {
//     userId: "69cfa70d499a315771de279d",
//     date: new Date("2026-04-01"),
//     breakfast: true,
//     lunch: true,
//     dinner: false,
//   },
//   {
//     userId: "69cfb3ba366f4ed09b6f80d5",
//     date: new Date("2026-04-02"),
//     breakfast: false,
//     lunch: true,
//     dinner: true,
//   },
//   {
//     userId: "69d0cc321009506f63c9d83c",
//     date: new Date("2026-04-01"),
//     breakfast: true,
//     lunch: false,
//     dinner: true,
//   },
// ];

// const seedMeals = async () => {
//   try {
//     await connectDB();
//     await Meal.insertMany(meals);
//     console.log("✅ Meal data inserted");
//     process.exit(0);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// };

// seedMeals();