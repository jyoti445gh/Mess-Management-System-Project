import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─── Setup log directory ─────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR   = path.join(__dirname, "../../logs");
const LOG_FILE  = path.join(LOG_DIR, "app.log");
const ERR_FILE  = path.join(LOG_DIR, "error.log");

// Create logs/ folder if it doesn't exist
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

// ─── Level config ────────────────────────────────────────────────────────────
const LEVELS = {
  ERROR:   { label: "ERROR"   },
  WARN:    {  label: "WARN"    },
  INFO:    { label: "INFO"    },
  SUCCESS: { label: "SUCCESS" },
  HTTP:    { label: "HTTP"    },
};

// ─── Core log function ───────────────────────────────────────────────────────
const log = (level, message, meta = null) => {
  const now       = new Date();
  const timeStr   = now.toLocaleTimeString();
  const isoStr    = now.toISOString();
  const { label } = LEVELS[level] || LEVELS.INFO;

  // Console output
  const consoleLine = meta
    ? `[${timeStr}] ${label}  ${message}`
    : `[${timeStr}] ${label}  ${message}`;

  console.log(consoleLine);
  if (meta) console.log("         ", meta);

  // File output — structured JSON line
  const fileLine = JSON.stringify({
    timestamp: isoStr,
    level: label,
    message,
    ...(meta ? { meta } : {}),
  });

  // Write to app.log (all levels)
  fs.appendFileSync(LOG_FILE, fileLine + "\n");

  // Write to error.log (errors only)
  if (level === "ERROR") {
    fs.appendFileSync(ERR_FILE, fileLine + "\n");
  }
};

// ─── Public API ──────────────────────────────────────────────────────────────
export const logger = {
  info:    (msg, meta) => log("INFO",    msg, meta),
  success: (msg, meta) => log("SUCCESS", msg, meta),
  warn:    (msg, meta) => log("WARN",    msg, meta),
  error:   (msg, meta) => log("ERROR",   msg, meta),
  http:    (msg, meta) => log("HTTP",    msg, meta),
};
