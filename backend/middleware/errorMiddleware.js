import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    stack: err.stack?.split("\n")[1]?.trim() || "",
  });

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};
