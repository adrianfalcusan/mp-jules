// models/Achievement.js
const mongoose = require("mongoose");

const achievementDefinitionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "🏆",
    },
    category: {
      type: String,
      enum: ["progress", "streak", "completion", "time", "social", "special"],
      default: "progress",
    },
    criteria: {
      type: {
        type: String,
        enum: [
          "courses_completed",
          "tutorials_completed",
          "streak_days",
          "time_spent",
          "progress_percentage",
          "special",
        ],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    points: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const userAchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AchievementDefinition",
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
achievementDefinitionSchema.index({ category: 1, isActive: 1 });
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
userAchievementSchema.index({ user: 1, isCompleted: 1 });

// Static methods for AchievementDefinition
achievementDefinitionSchema.statics.seedDefaultAchievements =
  async function () {
    const defaultAchievements = [
      {
        name: "First Steps",
        description: "Complete your first course",
        icon: "🎯",
        category: "progress",
        criteria: { type: "courses_completed", value: 1 },
        points: 10,
      },
      {
        name: "Tutorial Explorer",
        description: "Complete your first tutorial",
        icon: "🔍",
        category: "progress",
        criteria: { type: "tutorials_completed", value: 1 },
        points: 10,
      },
      {
        name: "Dedicated Learner",
        description: "Complete 5 courses",
        icon: "📚",
        category: "completion",
        criteria: { type: "courses_completed", value: 5 },
        points: 25,
      },
      {
        name: "Tutorial Master",
        description: "Complete 10 tutorials",
        icon: "🎬",
        category: "completion",
        criteria: { type: "tutorials_completed", value: 10 },
        points: 30,
      },
      {
        name: "3-Day Streak",
        description: "Learn for 3 consecutive days",
        icon: "🔥",
        category: "streak",
        criteria: { type: "streak_days", value: 3 },
        points: 15,
      },
      {
        name: "Week Warrior",
        description: "Learn for 7 consecutive days",
        icon: "⚡",
        category: "streak",
        criteria: { type: "streak_days", value: 7 },
        points: 30,
      },
      {
        name: "Marathon Learner",
        description: "Learn for 30 consecutive days",
        icon: "🏃‍♂️",
        category: "streak",
        criteria: { type: "streak_days", value: 30 },
        points: 100,
      },
      {
        name: "Time Keeper",
        description: "Spend 60 minutes learning",
        icon: "⏰",
        category: "time",
        criteria: { type: "time_spent", value: 60 },
        points: 20,
      },
      {
        name: "Marathon Session",
        description: "Spend 300 minutes (5 hours) learning",
        icon: "🕐",
        category: "time",
        criteria: { type: "time_spent", value: 300 },
        points: 50,
      },
      {
        name: "Music Scholar",
        description: "Spend 1000 minutes learning music",
        icon: "🎓",
        category: "time",
        criteria: { type: "time_spent", value: 1000 },
        points: 100,
      },
    ];

    for (const achievement of defaultAchievements) {
      await this.findOneAndUpdate({ name: achievement.name }, achievement, {
        upsert: true,
        new: true,
      });
    }
  };

// Static methods for UserAchievement
userAchievementSchema.statics.checkAndUnlockAchievements = async function (
  userId
) {
  const User = mongoose.model("User");
  const Progress = mongoose.model("Progress");
  const UserSession = mongoose.model("UserSession");
  const AchievementDefinition = mongoose.model("AchievementDefinition");

  // Get user stats
  const progressStats = await Progress.getUserStats(userId);
  const currentStreak = await UserSession.getCurrentStreak(userId);

  // Get all achievements
  const allAchievements = await AchievementDefinition.find({ isActive: true });

  const newAchievements = [];

  for (const achievementDef of allAchievements) {
    // Check if user already has this achievement
    const existing = await this.findOne({
      user: userId,
      achievement: achievementDef._id,
    });

    if (existing && existing.isCompleted) continue;

    let currentProgress = 0;
    let isCompleted = false;

    // Check criteria
    switch (achievementDef.criteria.type) {
      case "courses_completed":
        currentProgress = progressStats.completedContent; // This would need to be filtered by courses
        isCompleted = currentProgress >= achievementDef.criteria.value;
        break;

      case "tutorials_completed":
        currentProgress = progressStats.completedContent; // This would need to be filtered by tutorials
        isCompleted = currentProgress >= achievementDef.criteria.value;
        break;

      case "streak_days":
        currentProgress = currentStreak;
        isCompleted = currentProgress >= achievementDef.criteria.value;
        break;

      case "time_spent":
        currentProgress = progressStats.totalTimeSpent;
        isCompleted = currentProgress >= achievementDef.criteria.value;
        break;
    }

    // Create or update user achievement
    const userAchievement = await this.findOneAndUpdate(
      { user: userId, achievement: achievementDef._id },
      {
        progress: currentProgress,
        isCompleted,
        ...(isCompleted && !existing?.isCompleted
          ? { unlockedAt: new Date() }
          : {}),
      },
      { upsert: true, new: true }
    ).populate("achievement");

    if (isCompleted && !existing?.isCompleted) {
      newAchievements.push(userAchievement);
    }
  }

  return newAchievements;
};

userAchievementSchema.statics.getUserAchievements = async function (userId) {
  return this.find({ user: userId })
    .populate("achievement")
    .sort({ unlockedAt: -1 });
};

const AchievementDefinition = mongoose.model(
  "AchievementDefinition",
  achievementDefinitionSchema
);
const UserAchievement = mongoose.model(
  "UserAchievement",
  userAchievementSchema
);

module.exports = { AchievementDefinition, UserAchievement };
