import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    breakfast: {
      type: Boolean,
      default: true,
    },

    lunch: {
      type: Boolean,
      default: true,
    },

    dinner: {
      type: Boolean,
      default: true,
    },

    // Optional: track if student skipped after opting
    isSkipped: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate entry for same user + same date
mealSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Meal", mealSchema);