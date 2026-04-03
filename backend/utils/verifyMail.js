import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
import { transporter } from "./mailer.js";
import { ENV } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const verifyMail = async (token, email) => {
  try {
    // load template
    const templatePath = path.join(
      __dirname,
      "../templates/verifyEmail.hbs"
    );

    const source = fs.readFileSync(templatePath, "utf-8");

    const compiledTemplate = handlebars.compile(source);

    const html = compiledTemplate({
      token: encodeURIComponent(token),
      frontendUrl: ENV.FRONTEND_URL || "http://localhost:5173",
    });

    console.log("Sending verification email to:", email);
    console.log("Frontend URL:", ENV.FRONTEND_URL || "http://localhost:5173");

    // send mail
    const info = await transporter.sendMail({
      from: `"Mess Management" <${ENV.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html,
    });

    console.log("Email sent successfully:", info.messageId);

  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Email verification failed");
  }
};


