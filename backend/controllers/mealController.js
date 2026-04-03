import Meal from "../models/mealModel.js";


// ================= OPT MEAL =================
export const optMeal = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, breakfast, lunch, dinner } = req.body;

    const selectedDate = new Date(date);

    let meal = await Meal.findOne({ userId, date: selectedDate });

    if (meal) {
      meal.breakfast = breakfast ?? meal.breakfast;
      meal.lunch = lunch ?? meal.lunch;
      meal.dinner = dinner ?? meal.dinner;

      await meal.save();

      return res.json({ success: true, message: "Meal updated", data: meal });
    }

    meal = await Meal.create({
      userId,
      date: selectedDate,
      breakfast,
      lunch,
      dinner,
    });

    return res.status(201).json({
      success: true,
      message: "Meal opted successfully",
      data: meal,
    });

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


// ================= GET MEAL COUNT =================
export const getMealCounts = async (req, res) => {
  try {
    const { date } = req.query;

    const meals = await Meal.find({ date: new Date(date) });

    const counts = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
    };

    meals.forEach((m) => {
      if (m.breakfast) counts.breakfast++;
      if (m.lunch) counts.lunch++;
      if (m.dinner) counts.dinner++;
    });

    return res.json({
      success: true,
      data: { ...counts, totalUsers: meals.length },
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};