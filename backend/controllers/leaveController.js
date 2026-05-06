import Leave from "../models/leaveModel.js";
import Meal from "../models/mealModel.js";
import User from "../models/userModel.js";
import { transporter } from "../utils/mailer.js";
import { ENV } from "../config/env.js";

// Helper: iterate every date between start and end (inclusive)
const eachDay = (start, end) => {
  const days = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

// POST /api/leave/apply  (student)
export const applyLeave = async (req, res) => {
  try {
    const studentId = req.userId;
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      return res.status(400).json({ success: false, message: "endDate must be on or after startDate" });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const leave = await Leave.create({ studentId, startDate: start, endDate: end, reason });

    // Notify admin via email
    const adminEmail = ENV.ADMIN_EMAIL;
    if (adminEmail) {
      await transporter.sendMail({
        from: `"Mess Management" <${ENV.EMAIL_USER}>`,
        to: adminEmail,
        subject: "New Leave Request",
        html: `
          <h3>Leave Request from ${student.name}</h3>
          <p><b>Email:</b> ${student.email}</p>
          <p><b>From:</b> ${start.toDateString()}</p>
          <p><b>To:</b> ${end.toDateString()}</p>
          <p><b>Reason:</b> ${reason || "Not provided"}</p>
          <p>Login to the admin panel to approve or reject this request.</p>
        `,
      });
    }

    return res.status(201).json({ success: true, message: "Leave applied successfully", data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/my  (student — own leaves)
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ studentId: req.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/all  (admin)
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("studentId", "name email EnrollmentId")
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/leave/:id/approve  (admin)
export const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("studentId", "name email");
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    if (leave.status !== "pending") {
      return res.status(400).json({ success: false, message: `Leave is already ${leave.status}` });
    }

    leave.status = "approved";
    await leave.save();

    // Turn off all meals for every day in the leave range
    const days = eachDay(leave.startDate, leave.endDate);
    const ops = days.map((day) => ({
      updateOne: {
        filter: { userId: leave.studentId._id, date: day },
        update: { $set: { breakfast: false, lunch: false, dinner: false } },
        upsert: true,
      },
    }));
    if (ops.length) await Meal.bulkWrite(ops);

    // Confirmation email to student
    await transporter.sendMail({
      from: `"Mess Management" <${ENV.EMAIL_USER}>`,
      to: leave.studentId.email,
      subject: "Leave Approved",
      html: `
        <h3>Hi ${leave.studentId.name},</h3>
        <p>Your leave request has been <b>approved</b>.</p>
        <p><b>From:</b> ${new Date(leave.startDate).toDateString()}</p>
        <p><b>To:</b> ${new Date(leave.endDate).toDateString()}</p>
        <p>All meals (breakfast, lunch, dinner) have been turned off for these dates.</p>
        <p>Enjoy your time at home!</p>
      `,
    });

    return res.json({ success: true, message: "Leave approved and meals updated", data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/leave/:id/reject  (admin)
export const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("studentId", "name email");
    if (!leave) return res.status(404).json({ success: false, message: "Leave not found" });

    if (leave.status !== "pending") {
      return res.status(400).json({ success: false, message: `Leave is already ${leave.status}` });
    }

    leave.status = "rejected";
    await leave.save();

    // Notify student of rejection
    await transporter.sendMail({
      from: `"Mess Management" <${ENV.EMAIL_USER}>`,
      to: leave.studentId.email,
      subject: "Leave Rejected",
      html: `
        <h3>Hi ${leave.studentId.name},</h3>
        <p>Your leave request from <b>${new Date(leave.startDate).toDateString()}</b> to <b>${new Date(leave.endDate).toDateString()}</b> has been <b>rejected</b>.</p>
        <p>Please contact the admin for more details.</p>
      `,
    });

    return res.json({ success: true, message: "Leave rejected", data: leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
