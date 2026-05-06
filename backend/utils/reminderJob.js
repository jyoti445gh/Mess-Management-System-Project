import cron from "node-cron";
import User from "../models/userModel.js";
import { transporter } from "./mailer.js";
import { logger } from "./logger.js";

const sendReminders = async (mealType, cutoffTime) => {
  logger.info(`Sending ${mealType} reminders...`);

  let students;
  try {
    students = await User.find({ role: "student", isVerified: true });
  } catch (err) {
    logger.error(`Failed to fetch students: ${err.message}`);
    return;
  }

  let sent = 0;
  for (const student of students) {
    try {
      await transporter.sendMail({
        to: student.email,
        subject: `⏰ Reminder: ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} opt-out closes at ${cutoffTime}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <h2 style="color:#16a34a">MessMate Reminder</h2>
            <p>Hello <strong>${student.name}</strong>,</p>
            <p>This is a reminder that the opt-out window for <strong>${mealType}</strong> closes at <strong>${cutoffTime}</strong> today.</p>
            <p>If you wish to skip ${mealType}, please update your preference before the deadline.</p>
            <p style="color:#6b7280;font-size:12px">You are receiving this because you are a registered student on MessMate.</p>
          </div>
        `,
      });
      sent++;
    } catch (err) {
      logger.error(`Failed to send to ${student.email}: ${err.message}`);
    }
  }

  logger.success(`${mealType} reminders sent: ${sent}/${students.length}`);
};

// 06:30 — 30 min before breakfast cutoff (07:00)
cron.schedule("30 6 * * *", () => sendReminders("breakfast", "07:00"));

// 11:30 — 30 min before lunch cutoff (12:00)
cron.schedule("30 11 * * *", () => sendReminders("lunch", "12:00"));

// 18:30 — 30 min before dinner cutoff (19:00)
cron.schedule("30 18 * * *", () => sendReminders("dinner", "19:00"));

logger.info("Notification cron jobs scheduled (06:30, 11:30, 18:30)");
