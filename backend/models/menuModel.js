import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },

    breakfast: {
      type: String,
      required: true,
      trim: true,
    },

    lunch: {
      type: String,
      required: true,
      trim: true,
    },

    dinner: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional: who created menu
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);