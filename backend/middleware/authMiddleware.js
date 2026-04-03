import jwt from "jsonwebtoken";
import { Session } from "../models/sessionModel.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // check header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // check session (important 🔥)
    const session = await Session.findOne({
      userId: decoded.id,
      token,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
      });
    }

    // attach user info
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};