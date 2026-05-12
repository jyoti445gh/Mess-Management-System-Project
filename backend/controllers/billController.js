import Bill from "../models/billModel.js";
import Meal from "../models/mealModel.js";
import User from "../models/userModel.js";
import { MEAL_COSTS } from "../config/constants.js";
import { logger } from "../utils/logger.js";

// ─── helpers ────────────────────────────────────────────────────────────────

const monthRange = (month, year) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end   = new Date(year, month,     0, 23, 59, 59, 999); // last day of month
  return { start, end };
};

const calcBillData = (meals) => {
  let breakfastCount = 0, lunchCount = 0, dinnerCount = 0;
  meals.forEach((m) => {
    if (m.breakfast) breakfastCount++;
    if (m.lunch)     lunchCount++;
    if (m.dinner)    dinnerCount++;
  });
  const breakfastCost = breakfastCount * MEAL_COSTS.breakfast;
  const lunchCost     = lunchCount     * MEAL_COSTS.lunch;
  const dinnerCost    = dinnerCount    * MEAL_COSTS.dinner;
  const totalAmount   = breakfastCost + lunchCost + dinnerCost;
  return { breakfastCount, lunchCount, dinnerCount, breakfastCost, lunchCost, dinnerCost, totalAmount };
};

// ─── POST /api/bills/generate  (admin) ──────────────────────────────────────
// Generate (or regenerate) bills for ALL students for a given month/year
export const generateBills = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ success: false, message: "month and year are required" });

    const { start, end } = monthRange(month, year);

    // All students
    const students = await User.find({ role: "student" }, "_id");

    const results = [];
    for (const student of students) {
      const meals = await Meal.find({ userId: student._id, date: { $gte: start, $lte: end } });
      const data  = calcBillData(meals);

      const bill = await Bill.findOneAndUpdate(
        { studentId: student._id, month, year },
        { ...data },
        { upsert: true, new: true }
      );
      results.push(bill);
    }

    logger.success(`Bills generated: ${results.length} students | ${month}/${year}`);
    return res.json({ success: true, message: `Bills generated for ${results.length} students`, data: results });
  } catch (error) {
    logger.error("generateBills failed", { error: error.message });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/bills/my?month=&year=  (student) ──────────────────────────────
export const getMyBill = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { studentId: req.userId };
    if (month && year) { query.month = Number(month); query.year = Number(year); }

    const bills = await Bill.find(query).sort({ year: -1, month: -1 });
    return res.json({ success: true, data: bills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/bills/all?month=&year=  (admin) ────────────────────────────────
export const getAllBills = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month && year) { query.month = Number(month); query.year = Number(year); }

    const bills = await Bill.find(query)
      .populate("studentId", "name email EnrollmentId")
      .sort({ year: -1, month: -1, "studentId.name": 1 });

    return res.json({ success: true, data: bills });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/bills/:id/mark-paid  (admin) ────────────────────────────────
export const markPaid = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { isPaid: true, paidAt: new Date() },
      { new: true }
    ).populate("studentId", "name email");

    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });
    logger.success(`Bill marked paid: ${bill.studentId?.email} | ₹${bill.totalAmount}`);
    return res.json({ success: true, message: "Bill marked as paid", data: bill });
  } catch (error) {
    logger.error("markPaid failed", { error: error.message, billId: req.params.id });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/bills/:id/mark-unpaid  (admin) ──────────────────────────────
export const markUnpaid = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { isPaid: false, paidAt: null },
      { new: true }
    ).populate("studentId", "name email");

    if (!bill) return res.status(404).json({ success: false, message: "Bill not found" });
    logger.info(`Bill marked unpaid: ${bill.studentId?.email}`);
    return res.json({ success: true, message: "Bill marked as unpaid", data: bill });
  } catch (error) {
    logger.error("markUnpaid failed", { error: error.message, billId: req.params.id });
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/bills/summary?month=&year=  (admin) ───────────────────────────
export const getBillSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: "month and year required" });

    const bills = await Bill.find({ month: Number(month), year: Number(year) });

    const totalStudents = bills.length;
    const totalAmount   = bills.reduce((s, b) => s + b.totalAmount, 0);
    const paidCount     = bills.filter(b => b.isPaid).length;
    const unpaidCount   = totalStudents - paidCount;
    const collectedAmount = bills.filter(b => b.isPaid).reduce((s, b) => s + b.totalAmount, 0);
    const pendingAmount   = bills.filter(b => !b.isPaid).reduce((s, b) => s + b.totalAmount, 0);

    return res.json({
      success: true,
      data: { totalStudents, totalAmount, paidCount, unpaidCount, collectedAmount, pendingAmount },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
