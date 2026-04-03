import Joi from "joi";


// ================= OPT MEAL =================
export const mealSchema = Joi.object({
  date: Joi.date().required(),

  breakfast: Joi.boolean().optional(),
  lunch: Joi.boolean().optional(),
  dinner: Joi.boolean().optional(),
});