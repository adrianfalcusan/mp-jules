// routes/progress.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");
const auth = require("../middlewares/auth");
const rateLimit = require("express-rate-limit");

// Limit progress updates (e.g., bursty clients) – 60 requests/min/IP
const progressLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function to get content model
const getContentModel = (contentType) => {
  switch (contentType) {
    case "course":
      return Course;
    case "tutorial":
      return Tutorial;
    default:
      throw new Error("Invalid content type");
  }
};

// Helper function to find or create progress entry
const findOrCreateProgress = async (userId, contentType, contentId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Use the Progress model instead of user.progress
  const Progress = require("../models/Progress");

  // Find existing progress
  let progressEntry = await Progress.findOne({
    user: userId,
    contentType,
    contentId,
  });

  // Create new progress entry if it doesn't exist
  if (!progressEntry) {
    progressEntry = new Progress({
      user: userId,
      contentType,
      contentId,
      progressPercentage: 0,
      timeSpent: 0, // This will now be pure video watch time
      lastPosition: 0,
      isCompleted: false,
      completedSections: [],
      sessions: [],
      achievements: [],
      lastAccessed: new Date(),
      createdAt: new Date(),
    });
    await progressEntry.save();
  }

  return { user, progressEntry };
};

// Start a new learning session
router.post("/start-session", auth, async (req, res) => {
  try {
    const { contentType, contentId } = req.body;
    const userId = req.user.id;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: "Content type and content ID are required",
      });
    }

    // Verify content exists
    const ContentModel = getContentModel(contentType);
    const content = await ContentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const { user, progressEntry } = await findOrCreateProgress(
      userId,
      contentType,
      contentId
    );

    // Create new session entry (without duration tracking)
    const newSession = {
      startTime: new Date(),
      videoWatchTime: 0, // Track only video watch time
      progressAtStart: progressEntry.progressPercentage,
      lastActivity: new Date(),
    };

    progressEntry.sessions.push(newSession);
    progressEntry.lastAccessed = new Date();

    await progressEntry.save();

    console.log(
      `Started session for user ${userId}, content ${contentType}/${contentId}`
    );

    res.json({
      success: true,
      message: "Session started successfully",
      data: {
        sessionId: newSession._id,
        progress: {
          progressPercentage: progressEntry.progressPercentage,
          timeSpent: progressEntry.timeSpent,
          lastPosition: progressEntry.lastPosition,
          isCompleted: progressEntry.isCompleted,
          completedSections: progressEntry.completedSections,
        },
      },
    });
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start session",
      error: error.message,
    });
  }
});

// Update progress - Frontend compatible endpoint
router.post("/update", auth, progressLimiter, async (req, res) => {
  try {
    const {
      contentType,
      contentId,
      timeSpentMinutes = 0,
      progressPercentage,
      lastPosition,
      sectionId,
    } = req.body;
    const userId = req.user.id;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: "Content type and content ID are required",
      });
    }

    // Use the Progress model for consistency with dashboard
    const Progress = require("../models/Progress");
    const UserSession = require("../models/UserSession");

    let progress = await Progress.findOne({
      user: userId,
      contentType,
      contentId,
    });

    if (!progress) {
      progress = new Progress({
        user: userId,
        contentType,
        contentId,
        progressPercentage: 0,
        timeSpent: 0,
        lastPosition: 0,
      });
    }

    // Update progress
    if (progressPercentage !== undefined) {
      await progress.updateProgress(progressPercentage, timeSpentMinutes);
    } else if (timeSpentMinutes > 0) {
      progress.timeSpent += timeSpentMinutes;
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    if (lastPosition !== undefined) {
      progress.lastPosition = lastPosition;
      await progress.save();
    }

    // Record session activity for streak tracking
    if (timeSpentMinutes > 0 || progressPercentage !== undefined) {
      await UserSession.recordActivity(userId, {
        contentType,
        contentId,
        timeSpent: timeSpentMinutes,
        progressMade: progressPercentage
          ? Math.max(
              0,
              progressPercentage -
                (progress.progressPercentage - progressPercentage || 0)
            )
          : 0,
      });
    }

    // Check achievements
    const { UserAchievement } = require("../models/Achievement");
    const newAchievements = await UserAchievement.checkAndUnlockAchievements(
      userId
    );

    res.json({
      success: true,
      message: "Progress updated successfully",
      data: {
        progress: {
          progressPercentage: progress.progressPercentage,
          timeSpent: progress.timeSpent,
          lastPosition: progress.lastPosition,
          isCompleted: progress.isCompleted,
        },
        newAchievements: newAchievements.map((a) => ({
          name: a.achievement.name,
          description: a.achievement.description,
          icon: a.achievement.icon,
          points: a.achievement.points,
        })),
      },
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message,
    });
  }
});

// Update progress with video watch time - Legacy endpoint
router.post("/update-progress", auth, async (req, res) => {
  try {
    const {
      contentType,
      contentId,
      timeSpentMinutes = 0, // Only video watch time
      progressPercentage,
      lastPosition,
      sectionId,
    } = req.body;
    const userId = req.user.id;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: "Content type and content ID are required",
      });
    }

    const { user, progressEntry } = await findOrCreateProgress(
      userId,
      contentType,
      contentId
    );

    // Add video watch time (only when actually watching video)
    if (timeSpentMinutes > 0) {
      progressEntry.timeSpent += timeSpentMinutes;
      console.log(
        `Added ${timeSpentMinutes} minutes of video watch time. Total: ${progressEntry.timeSpent} minutes`
      );
    }

    // Update progress percentage if provided
    if (progressPercentage !== undefined) {
      progressEntry.progressPercentage = Math.max(
        progressEntry.progressPercentage,
        progressPercentage
      );
    }

    // Update last position if provided
    if (lastPosition !== undefined) {
      progressEntry.lastPosition = lastPosition;
    }

    // Handle section completion
    if (sectionId && !progressEntry.completedSections.includes(sectionId)) {
      progressEntry.completedSections.push(sectionId);
      console.log(`Section ${sectionId} completed`);
    }

    // Auto-complete if progress reaches 100%
    if (progressEntry.progressPercentage >= 100 && !progressEntry.isCompleted) {
      progressEntry.isCompleted = true;
      progressEntry.completedAt = new Date();
      console.log(
        `Content ${contentType}/${contentId} completed by user ${userId}`
      );
    }

    // Update current session
    const currentSession =
      progressEntry.sessions[progressEntry.sessions.length - 1];
    if (currentSession && !currentSession.endTime) {
      currentSession.videoWatchTime += timeSpentMinutes;
      currentSession.lastActivity = new Date();
      currentSession.progressAtEnd = progressEntry.progressPercentage;
    }

    progressEntry.lastAccessed = new Date();
    await progressEntry.save();

    res.json({
      success: true,
      message: "Progress updated successfully",
      data: {
        progress: {
          progressPercentage: progressEntry.progressPercentage,
          timeSpent: progressEntry.timeSpent,
          lastPosition: progressEntry.lastPosition,
          isCompleted: progressEntry.isCompleted,
          completedSections: progressEntry.completedSections,
        },
      },
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message,
    });
  }
});

// Get content progress
router.get("/content/:contentType/:contentId", auth, async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Use the Progress model instead of user.progress
    const Progress = require("../models/Progress");
    const progressEntry = await Progress.findOne({
      user: userId,
      contentType,
      contentId,
    });

    if (!progressEntry) {
      return res.json({
        success: true,
        data: {
          progress: {
            progressPercentage: 0,
            timeSpent: 0,
            lastPosition: 0,
            isCompleted: false,
            completedSections: [],
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        progress: {
          progressPercentage: progressEntry.progressPercentage,
          timeSpent: progressEntry.timeSpent,
          lastPosition: progressEntry.lastPosition,
          isCompleted: progressEntry.isCompleted,
          completedSections: progressEntry.completedSections,
        },
      },
    });
  } catch (error) {
    console.error("Error getting content progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get content progress",
      error: error.message,
    });
  }
});

// Get user's learning statistics (frontend compatibility)
router.get("/user", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Use the Progress model method for consistency
    const Progress = require("../models/Progress");
    const UserSession = require("../models/UserSession");

    const progressStats = await Progress.getUserStats(userId);
    const sessionStats = await UserSession.getUserStats(userId);

    res.json({
      success: true,
      stats: {
        ...progressStats,
        currentStreak: sessionStats.currentStreak || 0,
        totalDays: sessionStats.totalDays || 0,
        averageTimePerDay: sessionStats.averageTimePerDay || 0,
      },
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user statistics",
      error: error.message,
    });
  }
});

// Get user's learning statistics (video watch time focused) - Legacy endpoint
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Use the Progress model instead of user.progress
    const Progress = require("../models/Progress");
    const userProgress = await Progress.find({ user: userId });

    const stats = {
      totalVideoWatchTime: 0, // Sum of all video watch time
      totalContent: userProgress.length,
      completedContent: 0,
      averageProgress: 0,
      contentByType: {},
      recentActivity: [],
    };

    // Calculate statistics
    let totalProgress = 0;
    for (const progress of userProgress) {
      stats.totalVideoWatchTime += progress.timeSpent;
      totalProgress += progress.progressPercentage;

      if (progress.isCompleted) {
        stats.completedContent++;
      }

      // Group by content type
      if (!stats.contentByType[progress.contentType]) {
        stats.contentByType[progress.contentType] = {
          total: 0,
          completed: 0,
          totalWatchTime: 0,
        };
      }
      stats.contentByType[progress.contentType].total++;
      stats.contentByType[progress.contentType].totalWatchTime +=
        progress.timeSpent;
      if (progress.isCompleted) {
        stats.contentByType[progress.contentType].completed++;
      }

      // Recent activity
      if (progress.lastAccessedAt) {
        stats.recentActivity.push({
          contentType: progress.contentType,
          contentId: progress.contentId,
          lastAccessed: progress.lastAccessedAt,
          progress: progress.progressPercentage,
          videoWatchTime: progress.timeSpent,
        });
      }
    }

    stats.averageProgress =
      stats.totalContent > 0 ? totalProgress / stats.totalContent : 0;
    stats.recentActivity.sort(
      (a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)
    );
    stats.recentActivity = stats.recentActivity.slice(0, 10); // Last 10 activities

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user statistics",
      error: error.message,
    });
  }
});

// Get streak data - Frontend compatible endpoint
router.get("/streak", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const UserSession = require("../models/UserSession");
    const Progress = require("../models/Progress");

    // Get current streak
    const currentStreak = await UserSession.getCurrentStreak(userId);

    // Get streak history
    const streakHistory = await UserSession.getStreakHistory(userId, days);

    // Get recent activity for the requested days
    const recentActivity = await Progress.getRecentActivity(userId, days);

    res.json({
      success: true,
      currentStreak,
      streakHistory,
      recentActivity: recentActivity.map((activity) => ({
        date: activity.lastAccessedAt,
        contentType: activity.contentType,
        contentId: activity.contentId,
        progressMade: activity.progressPercentage,
        timeSpent: activity.timeSpent,
      })),
      days,
    });
  } catch (error) {
    console.error("Error getting streak data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get streak data",
      error: error.message,
    });
  }
});

// Get tutorial content progress - specific endpoint for frontend compatibility
router.get("/content/tutorial/:tutorialId", auth, async (req, res) => {
  try {
    const { tutorialId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Use the Progress model
    const Progress = require("../models/Progress");
    const progressEntry = await Progress.findOne({
      user: userId,
      contentType: "tutorial",
      contentId: tutorialId,
    });

    if (!progressEntry) {
      return res.json({
        success: true,
        data: {
          progress: {
            progressPercentage: 0,
            timeSpent: 0,
            lastPosition: 0,
            isCompleted: false,
            completedSections: [],
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        progress: {
          progressPercentage: progressEntry.progressPercentage,
          timeSpent: progressEntry.timeSpent,
          lastPosition: progressEntry.lastPosition,
          isCompleted: progressEntry.isCompleted,
          completedSections: progressEntry.completedSections,
        },
      },
    });
  } catch (error) {
    console.error("Error getting tutorial content progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get content progress",
      error: error.message,
    });
  }
});

module.exports = router;
