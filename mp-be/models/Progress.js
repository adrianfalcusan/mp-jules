// models/Progress.js
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["course", "tutorial"],
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Progress percentage (0-100)
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Time spent in minutes
    timeSpent: {
      type: Number,
      default: 0,
    },
    // Last watched position in seconds (for video content)
    lastPosition: {
      type: Number,
      default: 0,
    },
    // Completed lessons/sections (for courses with multiple parts)
    completedSections: [
      {
        sectionId: String,
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Learning sessions for this content
    sessions: [
      {
        startTime: {
          type: Date,
          default: Date.now,
        },
        endTime: {
          type: Date,
        },
        videoWatchTime: {
          type: Number,
          default: 0,
        },
        progressAtStart: {
          type: Number,
          default: 0,
        },
        progressAtEnd: {
          type: Number,
        },
        lastActivity: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Whether the content is fully completed
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one progress record per user per content
progressSchema.index(
  { user: 1, contentType: 1, contentId: 1 },
  { unique: true }
);

// Index for efficient queries
progressSchema.index({ user: 1, lastAccessedAt: -1 });
progressSchema.index({ user: 1, isCompleted: 1 });

// Methods
progressSchema.methods.updateProgress = function (
  newPercentage,
  timeSpentMinutes = 0
) {
  this.progressPercentage = Math.min(100, Math.max(0, newPercentage));
  this.timeSpent += timeSpentMinutes;
  this.lastAccessedAt = new Date();

  if (this.progressPercentage >= 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }

  return this.save();
};

progressSchema.methods.addCompletedSection = function (sectionId) {
  if (!this.completedSections.find((s) => s.sectionId === sectionId)) {
    this.completedSections.push({
      sectionId,
      completedAt: new Date(),
    });
  }
  this.lastAccessedAt = new Date();
  return this.save();
};

// Static methods
progressSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalContent: { $sum: 1 },
        completedContent: {
          $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
        },
        averageProgress: { $avg: "$progressPercentage" },
        totalTimeSpent: { $sum: "$timeSpent" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalContent: 0,
      completedContent: 0,
      averageProgress: 0,
      totalTimeSpent: 0,
    }
  );
};

progressSchema.statics.getRecentActivity = async function (userId, days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    user: userId,
    lastAccessedAt: { $gte: cutoffDate },
  })
    .populate("contentId")
    .sort({ lastAccessedAt: -1 })
    .limit(10);
};

module.exports = mongoose.model("Progress", progressSchema);
