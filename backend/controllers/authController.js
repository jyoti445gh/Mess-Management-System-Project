import { sendOtpMail } from "../utils/sendOtpMail.js";
import { Session } from "../models/sessionModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.validatedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 min

    await user.save();

    // Send OTP to user's email
    await sendOtpMail(email, otp);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email for verification",
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= VERIFY OTP (for registration and forgot password) =================
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.validatedData;
    const email = req.params.email;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true; // Mark email as verified
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.json({ success: true, message: "OTP verified successfully. Email is now verified." });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials or email not verified",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "10d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "30d" }
    );

    await Session.deleteMany({ userId: user._id });

    await Session.create({
      userId: user._id,
      token: accessToken,
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LOGOUT =================
export const logoutUser = async (req, res) => {
  try {
    await Session.deleteMany({ userId: req.userId });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.validatedData;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    await sendOtpMail(email, otp);

    return res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.validatedData;
    const email = req.params.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.json({ success: true, message: "Password changed successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= EMAIL VERIFICATION =================
export const verification = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const decoded = jwt.verify(decodeURIComponent(token), process.env.SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    user.isVerified = true;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};