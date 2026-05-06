import Menu from '../models/menuModel.js';
import { WEEKLY_MENU } from '../data/weeklyMenuData.js';

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const getDayName = (date) => DAYS[new Date(date).getDay()];

// CREATE MENU 
export const createMenu = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner, isPublished } = req.body;

    const existing = await Menu.findOne({ date: new Date(date) });
    if (existing) {
      return res.status(400).json({ success: false, message: "Menu for this date already exists. Use update instead." });
    }

    const menu = await Menu.create({
      date: new Date(date),
      day: getDayName(date),
      breakfast: breakfast ?? '',
      lunch:     lunch     ?? '',
      dinner:    dinner    ?? '',
      createdBy: req.userId,
      isPublished: isPublished ?? false,
    });

    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE MENU 
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { breakfast, lunch, dinner, isPublished } = req.body;

    const menu = await Menu.findByIdAndUpdate(
      id,
      { breakfast, lunch, dinner, isPublished },
      { new: true, runValidators: true }
    );

    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });

    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET MENU BY DATE 
// Falls back to static weekly menu if no DB entry exists
export const getMenuByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    // Try DB first
    const menu = await Menu.findOne({ date: new Date(date) });
    if (menu) return res.json({ success: true, data: menu, source: 'db' });

    // Fall back to static weekly menu by day name
    const dayName = getDayName(date);
    const staticMenu = WEEKLY_MENU[dayName];
    if (staticMenu) {
      return res.json({
        success: true,
        data: { day: dayName, date, ...staticMenu, isPublished: true },
        source: 'static',
      });
    }

    res.status(404).json({ success: false, message: 'No menu found for this date' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL MENUS 
export const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ date: -1 });
    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET WEEKLY MENU 
// Returns static weekly menu merged with any DB overrides
export const getWeeklyMenu = async (req, res) => {
  try {
    // Build the 7-day static menu
    const result = Object.entries(WEEKLY_MENU).map(([day, meals]) => ({
      day,
      ...meals,
      isPublished: true,
      source: 'static',
    }));

    // Check if any DB menus exist for the current week and override
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const dbMenus = await Menu.find({
      date: { $gte: weekStart, $lte: weekEnd },
      isPublished: true,
    });

    dbMenus.forEach(dbMenu => {
      const idx = result.findIndex(r => r.day === dbMenu.day);
      if (idx !== -1) {
        result[idx] = { ...result[idx], ...dbMenu.toObject(), source: 'db' };
      }
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE MENU
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByIdAndDelete(id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    res.json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
