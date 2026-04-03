import express from "express";
import {
  createMenu,
  updateMenu,
  getMenuByDate,
  getAllMenus,
} from "../controllers/menuController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ================= PUBLIC =================

// get menu by date
router.get("/", getMenuByDate);

// get all menus
router.get("/all", getAllMenus);

// ================= ADMIN / MANAGER =================

// create menu
router.post(
  "/",
  protect,
  authorize("admin", "mess_manager"),
  createMenu
);

// update menu
router.put(
  "/:id",
  protect,
  authorize("admin", "mess_manager"),
  updateMenu
);

export default router;