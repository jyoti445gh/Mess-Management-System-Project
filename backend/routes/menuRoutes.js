import express from "express";
import { createMenu, updateMenu, deleteMenu, getMenuByDate, getAllMenus, getWeeklyMenu } from "../controllers/menuController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validate.js";
import { menuSchema } from "../validation/menuValidation.js";

const router = express.Router();

router.get("/weekly", getWeeklyMenu);
router.get("/all",    getAllMenus);
router.get("/",       getMenuByDate);
router.post("/",      protect, authorize("admin", "mess_manager"), validate(menuSchema), createMenu);
router.put("/:id",    protect, authorize("admin", "mess_manager"), validate(menuSchema), updateMenu);
router.delete("/:id", protect, authorize("admin", "mess_manager"), deleteMenu);

export default router;
