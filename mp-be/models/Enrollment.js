// models/Enrollment.js
const mongoose = require("mongoose");

/**
 * Universal enrollment:
 *   itemType:  "course"  |  "tutorial"
 *   itemId:    ObjectId of Course or Tutorial
 */
const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ["course", "tutorial"], required: true },

    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 }, // still available for video tracking
  },
  { timestamps: true }
);

/* one‑enrollment‑per‑user‑per‑item */
enrollmentSchema.index(
  { student: 1, itemId: 1, itemType: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);
