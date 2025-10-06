// models/UserSession.js
const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // Learning activities for this day
    activities: [
      {
        contentType: {
          type: String,
          enum: ["course", "tutorial"],
          required: true,
        },
        contentId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        timeSpent: {
          type: Number, // in minutes
          default: 0,
        },
        progressMade: {
          type: Number, // percentage points gained
          default: 0,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalTimeSpent: {
      type: Number, // total minutes for the day
      default: 0,
    },
    totalProgressMade: {
      type: Number, // total progress points for the day
      default: 0,
    },
    activitiesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSessionSchema.index({ user: 1, date: 1 }, { unique: true });
userSessionSchema.index({ user: 1, date: -1 });

// Methods
userSessionSchema.methods.addActivity = function (activity) {
  this.activities.push({
    ...activity,
    timestamp: new Date(),
  });

  this.totalTimeSpent += activity.timeSpent || 0;
  this.totalProgressMade += activity.progressMade || 0;
  this.activitiesCount = this.activities.length;

  return this.save();
};

// Static methods
userSessionSchema.statics.recordActivity = async function (userId, activity) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let session = await this.findOne({ user: userId, date: today });

  if (!session) {
    session = new this({
      user: userId,
      date: today,
      activities: [],
      totalTimeSpent: 0,
      totalProgressMade: 0,
      activitiesCount: 0,
    });
  }

  return session.addActivity(activity);
};

userSessionSchema.statics.getCurrentStreak = async function (userId) {
  const sessions = await this.find({ user: userId })
    .sort({ date: -1 })
    .limit(100); // Get last 100 days max

  if (sessions.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Start from today and go backwards
  for (let i = 0; i < sessions.length; i++) {
    const sessionDate = new Date(sessions[i].date);
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - i);

    // Check if there's a session for this day
    if (sessionDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      // If we're checking today and there's no session yet, continue
      if (
        i === 0 &&
        expectedDate.getTime() === new Date().setHours(0, 0, 0, 0)
      ) {
        // Check yesterday instead
        expectedDate.setDate(expectedDate.getDate() - 1);
        if (sessionDate.getTime() === expectedDate.getTime()) {
          streak++;
          continue;
        }
      }
      break;
    }
  }

  return streak;
};

userSessionSchema.statics.getStreakHistory = async function (
  userId,
  days = 30
) {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const sessions = await this.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  // Create array of all days with activity status
  const history = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const session = sessions.find(
      (s) => new Date(s.date).getTime() === date.getTime()
    );

    history.push({
      date: date,
      hasActivity: !!session,
      timeSpent: session?.totalTimeSpent || 0,
      activitiesCount: session?.activitiesCount || 0,
    });
  }

  return history;
};

userSessionSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalDays: { $sum: 1 },
        totalTimeSpent: { $sum: "$totalTimeSpent" },
        totalActivities: { $sum: "$activitiesCount" },
        averageTimePerDay: { $avg: "$totalTimeSpent" },
        averageActivitiesPerDay: { $avg: "$activitiesCount" },
      },
    },
  ]);

  const currentStreak = await this.getCurrentStreak(userId);

  return {
    ...(stats[0] || {
      totalDays: 0,
      totalTimeSpent: 0,
      totalActivities: 0,
      averageTimePerDay: 0,
      averageActivitiesPerDay: 0,
    }),
    currentStreak,
  };
};

module.exports = mongoose.model("UserSession", userSessionSchema);
