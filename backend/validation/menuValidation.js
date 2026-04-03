import Joi from "joi";


// ================= CREATE / UPDATE MENU =================
export const menuSchema = Joi.object({
  date: Joi.date().required(),

  breakfast: Joi.string().min(2).required(),
  lunch: Joi.string().min(2).required(),
  dinner: Joi.string().min(2).required(),
});