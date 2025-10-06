// routes/achievements.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const {
  AchievementDefinition,
  UserAchievement,
} = require("../models/Achievement");

// GET /api/achievements - Get all available achievements with user progress
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active achievements
    const allAchievements = await AchievementDefinition.find({
      isActive: true,
    }).sort({ category: 1, points: 1 });

    // Get user's achievement progress
    const userAchievements = await UserAchievement.find({
      user: userId,
    }).populate("achievement");

    // Create a map for quick lookup
    const userAchievementMap = {};
    userAchievements.forEach((ua) => {
      if (ua.achievement) {
        userAchievementMap[ua.achievement._id.toString()] = ua;
      }
    });

    // Combine achievement definitions with user progress
    const achievementsWithProgress = allAchievements.map((achievement) => {
      const userProgress = userAchievementMap[achievement._id.toString()];

      return {
        _id: achievement._id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        criteria: achievement.criteria,
        points: achievement.points,
        isCompleted: userProgress?.isCompleted || false,
        progress: userProgress?.progress || 0,
        unlockedAt: userProgress?.unlockedAt || null,
        progressPercentage: userProgress
          ? Math.min(
              100,
              (userProgress.progress / achievement.criteria.value) * 100
            )
          : 0,
      };
    });

    // Group by category
    const achievementsByCategory = {};
    achievementsWithProgress.forEach((achievement) => {
      if (!achievementsByCategory[achievement.category]) {
        achievementsByCategory[achievement.category] = [];
      }
      achievementsByCategory[achievement.category].push(achievement);
    });

    res.json({
      success: true,
      achievements: achievementsByCategory,
      summary: {
        total: allAchievements.length,
        completed: userAchievements.filter((ua) => ua.isCompleted).length,
        totalPoints: userAchievements
          .filter((ua) => ua.isCompleted)
          .reduce((sum, ua) => sum + (ua.achievement?.points || 0), 0),
      },
    });
  } catch (err) {
    console.error("Get achievements error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/achievements/user - Get user's completed achievements
router.get("/user", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const userAchievements = await UserAchievement.getUserAchievements(userId);

    res.json({
      success: true,
      achievements: userAchievements.map((ua) => ({
        _id: ua._id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        points: ua.achievement.points,
        isCompleted: ua.isCompleted,
        progress: ua.progress,
        unlockedAt: ua.unlockedAt,
        progressPercentage: Math.min(
          100,
          (ua.progress / ua.achievement.criteria.value) * 100
        ),
      })),
    });
  } catch (err) {
    console.error("Get user achievements error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/achievements/check-progress - Frontend compatible endpoint
router.post("/check-progress", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const newAchievements = await UserAchievement.checkAndUnlockAchievements(
      userId
    );

    res.json({
      success: true,
      newAchievements: newAchievements.map((ua) => ({
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        points: ua.achievement.points,
        unlockedAt: ua.unlockedAt,
      })),
    });
  } catch (err) {
    console.error("Check achievements error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/achievements/check - Manually trigger achievement check (Legacy)
router.post("/check", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const newAchievements = await UserAchievement.checkAndUnlockAchievements(
      userId
    );

    res.json({
      success: true,
      newAchievements: newAchievements.map((ua) => ({
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        points: ua.achievement.points,
        unlockedAt: ua.unlockedAt,
      })),
    });
  } catch (err) {
    console.error("Check achievements error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Admin routes for managing achievement definitions
// POST /api/achievements/admin/seed - Seed default achievements (admin only)
router.post("/admin/seed", auth, role(["admin"]), async (req, res) => {
  try {
    await AchievementDefinition.seedDefaultAchievements();

    res.json({
      success: true,
      message: "Default achievements seeded successfully",
    });
  } catch (err) {
    console.error("Seed achievements error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/achievements/admin/definitions - Get all achievement definitions (admin only)
router.get("/admin/definitions", auth, role(["admin"]), async (req, res) => {
  try {
    const achievements = await AchievementDefinition.find().sort({
      category: 1,
      points: 1,
    });

    res.json({
      success: true,
      achievements,
    });
  } catch (err) {
    console.error("Get achievement definitions error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/achievements/admin/definitions - Create new achievement definition (admin only)
router.post("/admin/definitions", auth, role(["admin"]), async (req, res) => {
  try {
    const achievement = new AchievementDefinition(req.body);
    await achievement.save();

    res.json({
      success: true,
      achievement,
    });
  } catch (err) {
    console.error("Create achievement error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT /api/achievements/admin/definitions/:id - Update achievement definition (admin only)
router.put(
  "/admin/definitions/:id",
  auth,
  role(["admin"]),
  async (req, res) => {
    try {
      const achievement = await AchievementDefinition.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!achievement) {
        return res
          .status(404)
          .json({ success: false, message: "Achievement not found" });
      }

      res.json({
        success: true,
        achievement,
      });
    } catch (err) {
      console.error("Update achievement error:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

// DELETE /api/achievements/admin/definitions/:id - Delete achievement definition (admin only)
router.delete(
  "/admin/definitions/:id",
  auth,
  role(["admin"]),
  async (req, res) => {
    try {
      const achievement = await AchievementDefinition.findByIdAndDelete(
        req.params.id
      );

      if (!achievement) {
        return res
          .status(404)
          .json({ success: false, message: "Achievement not found" });
      }

      // Also delete all user achievements for this definition
      await UserAchievement.deleteMany({ achievement: req.params.id });

      res.json({
        success: true,
        message: "Achievement deleted successfully",
      });
    } catch (err) {
      console.error("Delete achievement error:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

module.exports = router;
