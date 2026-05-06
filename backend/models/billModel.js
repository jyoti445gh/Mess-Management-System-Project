import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number, // 1–12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    breakfastCount: { type: Number, default: 0 },
    lunchCount:     { type: Number, default: 0 },
    dinnerCount:    { type: Number, default: 0 },
    breakfastCost:  { type: Number, default: 0 },
    lunchCost:      { type: Number, default: 0 },
    dinnerCost:     { type: Number, default: 0 },
    totalAmount:    { type: Number, default: 0 },
    isPaid:         { type: Boolean, default: false },
    paidAt:         { type: Date, default: null },
  },
  { timestamps: true }
);

// One bill per student per month/year
billSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Bill", billSchema);
