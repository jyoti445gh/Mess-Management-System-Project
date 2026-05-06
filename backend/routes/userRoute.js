import express from "express";
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";

import Joi from "joi";

const router = express.Router();

// validation schemas (local)
const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).optional(),
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid("student", "mess_committee", "mess_manager").required(),
});

// ================= USER =================

// get own profile
router.get("/profile", protect, getProfile);

// update profile
router.put(
  "/profile",
  protect,
  validate(updateProfileSchema),
  updateProfile
);

// ================= ADMIN =================

// get all users
router.get("/", protect, authorize("admin"), getAllUsers);

// get single user
router.get("/:id", protect, authorize("admin"), getUserById);

// update role
router.put(
  "/role/:id",
  protect,
  authorize("admin"),
  validate(updateRoleSchema),
  updateUserRole
);

// delete user
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;