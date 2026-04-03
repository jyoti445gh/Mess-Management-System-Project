import Menu from '../models/menuModel.js';

// ================= CREATE MENU =================
export const createMenu = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner, isPublished } = req.body;

    const menu = await Menu.create({
      date: new Date(date),
      breakfast,
      lunch,
      dinner,
      createdBy: req.userId,
      isPublished: isPublished ?? false,
    });

    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE MENU =================
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { breakfast, lunch, dinner, isPublished } = req.body;

    const menu = await Menu.findByIdAndUpdate(
      id,
      { breakfast, lunch, dinner, isPublished },
      { new: true }
    );

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET MENU BY DATE =================
export const getMenuByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const menu = await Menu.findOne({ date: new Date(date) });

    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET ALL MENUS =================
export const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ date: -1 });

    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
