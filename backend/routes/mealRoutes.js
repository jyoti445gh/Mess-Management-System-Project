import express from "express";
import {
  optMeal,
  getMyMeals,
  getMealCounts,
} from "../controllers/mealController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ================= USER =================

// opt-in / opt-out meal
router.post("/opt", protect, optMeal);

// get my meals
router.get("/my", protect, getMyMeals);

// ================= ADMIN / MANAGER =================

// meal counts
router.get(
  "/count",
  protect,
  authorize("admin", "mess_manager"),
  getMealCounts
);

export default router;