import express from "express";
import {
  generateBills,
  getMyBill,
  getAllBills,
  markPaid,
  markUnpaid,
  getBillSummary,
} from "../controllers/billController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Student
router.get("/my",       protect, authorize("student"), getMyBill);

// Admin
router.post("/generate",       protect, authorize("admin"), generateBills);
router.get("/all",             protect, authorize("admin"), getAllBills);
router.get("/summary",         protect, authorize("admin"), getBillSummary);
router.patch("/:id/mark-paid",   protect, authorize("admin"), markPaid);
router.patch("/:id/mark-unpaid", protect, authorize("admin"), markUnpaid);

export default router;
