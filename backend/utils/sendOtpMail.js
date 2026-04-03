import { transporter } from "./mailer.js";

/**
 * Send OTP email
 * @param {string} email - recipient email
 * @param {string} otp - 6-digit OTP
 * @param {"registration"|"forgot"} type - type of OTP
 */
export const sendOtpMail = async (email, otp, type = "forgot") => {
  try {
    const subject =
      type === "registration"
        ? "Verify Your Email - Mess Management System"
        : "Password Reset OTP - Mess Management System";

    const html =
      type === "registration"
        ? `
          <p>Welcome to Mess Management System!</p>
          <p>Your OTP for email verification is:</p>
          <h2>${otp}</h2>
          <p>This OTP is valid for 10 minutes.</p>
        `
        : `
          <p>Your OTP for password reset is:</p>
          <h2>${otp}</h2>
          <p>This OTP is valid for 10 minutes.</p>
        `;

    const mailOptions = {
      from: `"Mess Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    console.log(`OTP email sent to ${email} (${type})`);

  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    throw new Error("Failed to send OTP email");
  }
};