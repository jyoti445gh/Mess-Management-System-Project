import Joi from "joi";

// ================= CREATE / UPDATE MENU =================
export const menuSchema = Joi.object({
  date:        Joi.date().iso().required(),
  breakfast:   Joi.string().max(200).required(),
  lunch:       Joi.string().max(200).required(),
  dinner:      Joi.string().max(200).required(),
  isPublished: Joi.boolean().optional(),
});
