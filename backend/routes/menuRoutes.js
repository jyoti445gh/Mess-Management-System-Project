import express from "express";
import {
  createMenu,
  updateMenu,
  getMenuByDate,
  getAllMenus,
  getWeeklyMenu,
} from "../controllers/menuController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// IMPORTANT: specific routes MUST come before /:id param routes

// get weekly published menus (public)
router.get("/weekly", getWeeklyMenu);

// get all menus (public)
router.get("/all", getAllMenus);

// get menu by date (public) — e.g. /api/menu?date=2026-04-04
router.get("/", getMenuByDate);

// create menu (manager/admin)
router.post("/", protect, authorize("admin", "mess_manager"), createMenu);

// update menu (manager/admin)
router.put("/:id", protect, authorize("admin", "mess_manager"), updateMenu);

export default router;
