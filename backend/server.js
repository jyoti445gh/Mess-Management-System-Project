import express from "express";
import cors from "cors";
import morgan from "morgan";

import { ENV } from "./config/env.js";
import connectDB from "./config/db.js";

import passport from "./config/passport.js";
import dotenv from "dotenv";
import "./utils/reminderJob.js";
dotenv.config();

// routes
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import mealRoutes from "./routes/mealRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";

// middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();


// ================= CORE MIDDLEWARE =================

// body parser
app.use(express.json());

// CORS


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// logger
app.use(morgan("dev"));


// ================= PASSPORT =================
app.use(passport.initialize());


// ================= ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/menu", menuRoutes);


// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("🚀 Mess Management API is running...");
});


// ================= ERROR HANDLER =================
app.use(errorHandler);


// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on port ${ENV.PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();