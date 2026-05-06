import Joi from "joi";

// ================= OPT MEAL =================
export const mealSchema = Joi.object({
  date: Joi.date()
    .iso()
    .required()
    .messages({ 'date.base': 'Date must be a valid date in YYYY-MM-DD format' }),

  breakfast: Joi.boolean().optional(),
  lunch:     Joi.boolean().optional(),
  dinner:    Joi.boolean().optional(),
}).or('breakfast', 'lunch', 'dinner')  // at least one meal must be provided
  .messages({ 'object.missing': 'At least one meal (breakfast, lunch, or dinner) must be provided' });
