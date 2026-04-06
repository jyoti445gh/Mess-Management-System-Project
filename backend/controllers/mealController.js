import Meal from "../models/mealModel.js";
import { CUTOFF_TIMES, MEAL_COSTS } from "../config/constants.js";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Returns true if the cutoff for `mealType` has already passed today.
 */
const isCutoffPassed = (mealType) => {
  const now = new Date();
  const { hour, minute } = CUTOFF_TIMES[mealType];
  return now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute);
};

/**
 * Returns true if `date` (Date object) is strictly before today (midnight).
 */
const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// ─── controllers ────────────────────────────────────────────────────────────

// ================= OPT MEAL (with cutoff enforcement) =================
export const optMeal = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, breakfast, lunch, dinner } = req.body;

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // Reject past dates
    if (isPastDate(selectedDate)) {
      return res.status(400).json({
        success: false,
        message: "Cannot update meal preferences for past dates",
      });
    }

    // Check cutoff for each meal being updated (only for today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = selectedDate.getTime() === today.getTime();

    if (isToday) {
      const blocked = [];
      if (breakfast !== undefined && isCutoffPassed("breakfast")) blocked.push("breakfast");
      if (lunch     !== undefined && isCutoffPassed("lunch"))     blocked.push("lunch");
      if (dinner    !== undefined && isCutoffPassed("dinner"))    blocked.push("dinner");

      if (blocked.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cutoff has passed for: ${blocked.join(", ")}`,
          blocked,
        });
      }
    }

    let meal = await Meal.findOne({ userId, date: selectedDate });

    if (meal) {
      meal.breakfast = breakfast ?? meal.breakfast;
      meal.lunch     = lunch     ?? meal.lunch;
      meal.dinner    = dinner    ?? meal.dinner;
      await meal.save();
      return res.json({ success: true, message: "Meal updated", data: meal });
    }

    meal = await Meal.create({ userId, date: selectedDate, breakfast, lunch, dinner });
    return res.status(201).json({ success: true, message: "Meal opted successfully", data: meal });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET MY MEALS =================
export const getMyMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.userId }).sort({ date: -1 });
    return res.json({ success: true, data: meals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET MEAL COUNT (single date) =================
export const getMealCounts = async (req, res) => {
  try {
    const { date } = req.query;
    const meals = await Meal.find({ date: new Date(date) });

    const counts = { breakfast: 0, lunch: 0, dinner: 0 };
    meals.forEach((m) => {
      if (m.breakfast) counts.breakfast++;
      if (m.lunch)     counts.lunch++;
      if (m.dinner)    counts.dinner++;
    });

    return res.json({ success: true, data: { ...counts, totalUsers: meals.length } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CUTOFF STATUS =================
export const getCutoffStatus = async (req, res) => {
  try {
    const status = {
      breakfast: { cutoffPassed: isCutoffPassed("breakfast"), cutoffTime: "07:00" },
      lunch:     { cutoffPassed: isCutoffPassed("lunch"),     cutoffTime: "12:00" },
      dinner:    { cutoffPassed: isCutoffPassed("dinner"),    cutoffTime: "19:00" },
    };
    return res.json({ success: true, data: status });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= REFUND SERVICE =================
export const getRefund = async (req, res) => {
  try {
    const meals = await Meal.find({ userId: req.userId });

    const breakdown = {
      breakfast: { skipped: 0, subtotal: 0 },
      lunch:     { skipped: 0, subtotal: 0 },
      dinner:    { skipped: 0, subtotal: 0 },
    };

    meals.forEach((m) => {
      if (!m.breakfast) { breakdown.breakfast.skipped++; breakdown.breakfast.subtotal += MEAL_COSTS.breakfast; }
      if (!m.lunch)     { breakdown.lunch.skipped++;     breakdown.lunch.subtotal     += MEAL_COSTS.lunch; }
      if (!m.dinner)    { breakdown.dinner.skipped++;    breakdown.dinner.subtotal    += MEAL_COSTS.dinner; }
    });

    const total = breakdown.breakfast.subtotal + breakdown.lunch.subtotal + breakdown.dinner.subtotal;

    return res.json({ success: true, data: { total, breakdown, costs: MEAL_COSTS } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DATE-RANGE REPORT =================
export const getMealReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required (YYYY-MM-DD)" });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD" });
    }

    if (end < start) {
      return res.status(400).json({ success: false, message: "endDate must be on or after startDate" });
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > 31) {
      return res.status(400).json({ success: false, message: "Date range cannot exceed 31 days" });
    }

    // Fetch all meals in range
    end.setHours(23, 59, 59, 999);
    const meals = await Meal.find({ date: { $gte: start, $lte: end } });

    // Build per-day map
    const dayMap = {};
    meals.forEach((m) => {
      const key = m.date.toISOString().split("T")[0];
      if (!dayMap[key]) dayMap[key] = { breakfast: 0, lunch: 0, dinner: 0 };
      if (m.breakfast) dayMap[key].breakfast++;
      if (m.lunch)     dayMap[key].lunch++;
      if (m.dinner)    dayMap[key].dinner++;
    });

    // Fill every day in range (even days with no data)
    const report = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    const endDay = new Date(endDate);
    endDay.setHours(0, 0, 0, 0);

    while (cursor <= endDay) {
      const key = cursor.toISOString().split("T")[0];
      report.push({ date: key, ...(dayMap[key] || { breakfast: 0, lunch: 0, dinner: 0 }) });
      cursor.setDate(cursor.getDate() + 1);
    }

    return res.json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
