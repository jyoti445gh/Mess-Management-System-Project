import User from "../models/userModel.js";


//GET MY PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.validatedData;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL USERS (ADMIN) 
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: users,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//GET SINGLE USER (ADMIN)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//  UPDATE USER ROLE (ADMIN)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.validatedData;
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Cannot change admin or mess_manager roles
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: "Cannot change admin role" });
    }
    if (user.role === 'mess_manager') {
      return res.status(403).json({ success: false, message: "Mess manager role cannot be changed. Delete the account instead." });
    }

    // Only student ↔ mess_committee allowed
    if (!['student', 'mess_committee'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role can only be changed to student or mess_committee" });
    }

    user.role = role;
    await user.save();

    return res.json({ success: true, message: "User role updated", data: user });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


//  DELETE USER (ADMIN) 
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};