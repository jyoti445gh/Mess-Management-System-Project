import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
} from "../controllers/leaveController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Student routes
router.post("/apply",  protect, authorize("student"), applyLeave);
router.get("/my",      protect, authorize("student"), getMyLeaves);

// Admin routes
router.get("/all",            protect, authorize("admin"), getAllLeaves);
router.patch("/:id/approve",  protect, authorize("admin"), approveLeave);
router.patch("/:id/reject",   protect, authorize("admin"), rejectLeave);

export default router;
