import express from "express";
import {
  optMeal,
  getMyMeals,
  getMealCounts,
  getCutoffStatus,
  getRefund,
  getMealReport,
} from "../controllers/mealController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ================= PUBLIC =================

// cutoff status for today (used by student dashboard)
router.get("/cutoff-status", protect, getCutoffStatus);

// ================= STUDENT =================

// opt-in / opt-out meal (with cutoff enforcement)
router.post("/opt", protect, optMeal);

// get my meals
router.get("/my", protect, getMyMeals);

// refund summary
router.get("/refund", protect, authorize("student"), getRefund);

// ================= ADMIN / MANAGER =================

// single-date meal counts
router.get("/count", protect, authorize("admin", "mess_manager"), getMealCounts);

// date-range report
router.get("/report", protect, authorize("admin", "mess_manager"), getMealReport);

export default router;
