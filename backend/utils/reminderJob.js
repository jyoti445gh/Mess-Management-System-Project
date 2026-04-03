import cron from "node-cron";
import User from "../models/userModel.js";
import { transporter } from "./mailer.js";

// ⏰ runs every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  console.log("Running meal reminder job...");

  const users = await User.find({ isVerified: true });

  for (let user of users) {
    await transporter.sendMail({
      to: user.email,
      subject: "Meal Reminder",
      html: `
        <p>Hello ${user.name},</p>
        <p>⏰ Reminder: Meal opt-out closes at 9 AM.</p>
      `,
    });
  }

  console.log("Reminders sent!");
});