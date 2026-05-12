import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import morgan from "morgan";

import { ENV } from "./config/env.js";
import connectDB from "./config/db.js";
import passport from "./config/passport.js";
import "./utils/reminderJob.js";
import { logger } from "./utils/logger.js";

// routes
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import mealRoutes from "./routes/mealRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import billRoutes from "./routes/billRoutes.js";

// middleware
import { errorHandler } from "./middleware/errorMiddleware.js";
import { requestLogger } from "./middleware/requestLogger.js";

const app = express();


//  CORE MIDDLEWARE

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

// Request logger (writes to logs/)
app.use(requestLogger);


//  PASSPORT 
app.use(passport.initialize());


// ROUTES 

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/bills", billRoutes);


// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("Mess Management API is running...");
});


// ================= ERROR HANDLER =================
app.use(errorHandler);


// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      logger.success(`Server running on port ${ENV.PORT}`);
      logger.info(`Environment: ${ENV.NODE_ENV}`);
      logger.info(`Logs directory: logs/app.log`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();