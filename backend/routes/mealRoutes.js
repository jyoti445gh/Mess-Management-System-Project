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
import { validate } from "../middleware/validate.js";
import { mealSchema } from "../validation/mealValidation.js";

const router = express.Router();

router.get("/cutoff-status", protect, getCutoffStatus);
router.post("/opt",    protect, validate(mealSchema), optMeal);
router.get("/my",      protect, getMyMeals);
router.get("/refund",  protect, authorize("student"), getRefund);
router.get("/count",   protect, authorize("admin", "mess_manager"), getMealCounts);
router.get("/report",  protect, authorize("admin", "mess_manager"), getMealReport);

export default router;
