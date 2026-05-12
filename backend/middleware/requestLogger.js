import { logger } from "../utils/logger.js";

/**
 * HTTP request/response logger middleware.
 * Logs method, URL, status code, and response time for every request.
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const ms     = Date.now() - start;
    const status = res.statusCode;
    const level  = status >= 500 ? "error" : status >= 400 ? "warn" : "http";

    logger[level](
      `${req.method} ${req.originalUrl} ${status} — ${ms}ms`,
      req.body && Object.keys(req.body).length
        ? { body: sanitizeBody(req.body) }
        : null
    );
  });

  next();
};

// Remove sensitive fields before logging request body
const sanitizeBody = (body) => {
  const safe = { ...body };
  ["password", "newPassword", "confirmPassword", "otp", "token"].forEach(
    (key) => { if (safe[key]) safe[key] = "***"; }
  );
  return safe;
};
