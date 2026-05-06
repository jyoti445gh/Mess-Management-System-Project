import express from "express";
import passport from "../config/passport.js";

import {
  registerUser,
  verification,
  loginUser,
  logoutUser,
  forgotPassword,
  verifyOTP,
  changePassword,
} from "../controllers/authController.js";

import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  otpSchema,
  changePasswordSchema,
} from "../validation/authValidation.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// ================= AUTH =================

// register
router.post("/register", validate(registerSchema), registerUser);

// email verification
router.get("/verify", verification);

// login
router.post("/login", validate(loginSchema), loginUser);

// logout
router.post("/logout", protect, logoutUser);


// ================= PASSWORD =================

// forgot password (send OTP)
router.post("/forgot-password", validate(forgotSchema), forgotPassword);

// verify OTP
router.post("/verify-otp/:email", validate(otpSchema), verifyOTP);

// change password
router.post(
  "/change-password/:email",
  validate(changePasswordSchema),
  changePassword
);


// ================= GOOGLE AUTH =================

// redirect to google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // ✅ IMPORTANT (JWT based)
  })
);

// callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    import("jsonwebtoken").then(({ default: jwt }) => {
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.SECRET_KEY,
        { expiresIn: "10d" }
      );

      // Create session
      import("../models/sessionModel.js").then(({ Session }) => {
        Session.create({
          userId: req.user._id,
          token,
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        }).catch(err => console.error("Session create error:", err));
      });

      // Redirect to frontend with token
      res.redirect(`http://localhost:5173/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({ _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }))}`);
    });
  }
);

export default router;