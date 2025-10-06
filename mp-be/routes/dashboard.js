// routes/dashboard.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const UserSession = require("../models/UserSession");
const { UserAchievement } = require("../models/Achievement");
const Review = require("../models/Review");
// AWS SDK removed - using Bunny CDN only

function hasValidAWSCredentials() {
  return (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID !== "your_aws_access_key_id" &&
    process.env.AWS_SECRET_ACCESS_KEY !== "your_aws_secret_access_key" &&
    process.env.AWS_S3_BUCKET !== "your-s3-bucket-name"
  );
}

const s3 = hasValidAWSCredentials()
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

async function signThumbnail(key) {
  if (!key) return "";
  if (s3 && hasValidAWSCredentials()) {
    try {
      return await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
        }),
        { expiresIn: 3600 }
      );
    } catch (err) {
      // fall through to local fallback
    }
  }
  const baseUrl =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
  return `${baseUrl}/uploads/${key}`;
}

// GET /api/dashboard - Get comprehensive dashboard data
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Dashboard request for user ID:", userId);

    // Get enrolled courses and tutorials
    const enrollments = await Enrollment.find({ student: userId });
    console.log("Found enrollments:", enrollments.length);

    // Separate course and tutorial enrollments
    const courseEnrollments = enrollments.filter(
      (e) => e.itemType === "course"
    );
    const tutorialEnrollments = enrollments.filter(
      (e) => e.itemType === "tutorial"
    );
    console.log(
      "Course enrollments:",
      courseEnrollments.length,
      "Tutorial enrollments:",
      tutorialEnrollments.length
    );

    // Fetch the actual course and tutorial documents
    const courseIds = courseEnrollments.map((e) => e.itemId);
    const tutorialIds = tutorialEnrollments.map((e) => e.itemId);

    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate("teacher", "name")
      .select(
        "title description price thumbnail duration level category averageRating reviewCount"
      );

    const tutorials = await Tutorial.find({ _id: { $in: tutorialIds } })
      .populate("teacher", "name")
      .select(
        "title description price thumbnail duration level category averageRating reviewCount"
      );

    // Attach thumbnailUrl (S3 signed or local fallback)
    for (const c of courses) {
      if (c.thumbnail) {
        c._doc.thumbnailUrl = await signThumbnail(c.thumbnail);
      }
    }
    for (const t of tutorials) {
      if (t.thumbnail) {
        t._doc.thumbnailUrl = await signThumbnail(t.thumbnail);
      }
    }

    console.log(
      "Found courses:",
      courses.length,
      "Found tutorials:",
      tutorials.length
    );

    // Create maps for quick lookup
    const courseMap = {};
    courses.forEach((course) => {
      courseMap[course._id.toString()] = course;
    });

    const tutorialMap = {};
    tutorials.forEach((tutorial) => {
      tutorialMap[tutorial._id.toString()] = tutorial;
    });

    // Build enrolled courses with enrollment data
    const enrolledCourses = courseEnrollments
      .map((enrollment) => {
        const course = courseMap[enrollment.itemId.toString()];
        if (!course) return null;
        return {
          ...course.toObject(),
          enrolledAt: enrollment.enrolledAt,
          itemType: "course",
        };
      })
      .filter(Boolean);

    // Build enrolled tutorials with enrollment data
    const enrolledTutorials = tutorialEnrollments
      .map((enrollment) => {
        const tutorial = tutorialMap[enrollment.itemId.toString()];
        if (!tutorial) return null;
        return {
          ...tutorial.toObject(),
          enrolledAt: enrollment.enrolledAt,
          itemType: "tutorial",
        };
      })
      .filter(Boolean);

    console.log(
      "Enrolled courses processed:",
      enrolledCourses.length,
      "Enrolled tutorials processed:",
      enrolledTutorials.length
    );

    // Get progress data for enrolled content
    const progressData = await Progress.find({ user: userId });
    console.log("Found progress records:", progressData.length);

    const progressMap = {};
    progressData.forEach((p) => {
      progressMap[`${p.contentType}_${p.contentId}`] = p;
    });

    // Add progress to enrolled items
    enrolledCourses.forEach((course) => {
      const progress = progressMap[`course_${course._id}`];
      course.progress = progress ? progress.progressPercentage : 0;
      course.timeSpent = progress ? progress.timeSpent : 0;
      course.lastAccessed = progress
        ? progress.lastAccessedAt
        : course.enrolledAt;
      course.isCompleted = progress ? progress.isCompleted : false;
    });

    enrolledTutorials.forEach((tutorial) => {
      const progress = progressMap[`tutorial_${tutorial._id}`];
      tutorial.progress = progress ? progress.progressPercentage : 0;
      tutorial.timeSpent = progress ? progress.timeSpent : 0;
      tutorial.lastAccessed = progress
        ? progress.lastAccessedAt
        : tutorial.enrolledAt;
      tutorial.isCompleted = progress ? progress.isCompleted : false;
    });

    // Get user statistics
    const progressStats = await Progress.getUserStats(userId);
    const sessionStats = await UserSession.getUserStats(userId);
    console.log("Progress stats:", progressStats);
    console.log("Session stats:", sessionStats);

    // Get achievements
    const userAchievements = await UserAchievement.getUserAchievements(userId);
    const completedAchievements = userAchievements.filter((a) => a.isCompleted);
    const recentAchievements = completedAchievements
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
      .slice(0, 3);

    console.log(
      "User achievements:",
      userAchievements.length,
      "Completed:",
      completedAchievements.length
    );

    // Get recent activity
    const recentActivity = (await Progress.getRecentActivity(userId, 7)).map(
      (a) => ({
        ...a,
        progressPercentage: Number.isFinite(a.progressPercentage)
          ? a.progressPercentage
          : 0,
        timeSpent: Number.isFinite(a.timeSpent) ? a.timeSpent : 0,
      })
    );

    // Get learning streak history
    const streakHistory = await UserSession.getStreakHistory(userId, 30);

    // Calculate category distribution
    const categoryStats = {};
    [...enrolledCourses, ...enrolledTutorials].forEach((item) => {
      const category = item.category || "general";
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0 };
      }
      categoryStats[category].total++;
      if (item.isCompleted) {
        categoryStats[category].completed++;
      }
    });

    // Get recommendations (non-enrolled content)
    const allCourses = await Course.find({ isPublished: true })
      .populate("teacher", "name")
      .limit(20);
    const allTutorials = await Tutorial.find({ isPublished: true })
      .populate("teacher", "name")
      .limit(20);

    const enrolledIds = enrollments.map((e) => e.itemId.toString());
    const recommendedCourses = allCourses
      .filter((c) => !enrolledIds.includes(c._id.toString()))
      .slice(0, 6);
    const recommendedTutorials = allTutorials
      .filter((t) => !enrolledIds.includes(t._id.toString()))
      .slice(0, 6);

    // Attach thumbnailUrl to recommendations
    for (const c of recommendedCourses) {
      if (c.thumbnail) c._doc.thumbnailUrl = await signThumbnail(c.thumbnail);
    }
    for (const t of recommendedTutorials) {
      if (t.thumbnail) t._doc.thumbnailUrl = await signThumbnail(t.thumbnail);
    }

    // Calculate next milestones
    const nextMilestones = [];
    const totalEnrolled = enrolledCourses.length + enrolledTutorials.length;
    const totalCompleted = progressStats.completedContent || 0;

    if (totalCompleted < 1) {
      nextMilestones.push({
        type: "completion",
        title: "Complete your first course",
        description:
          "Finish any enrolled course to unlock your first achievement",
        progress: Math.min(100, (totalCompleted / 1) * 100),
        target: 1,
        current: totalCompleted,
      });
    }

    if (sessionStats.currentStreak < 7) {
      nextMilestones.push({
        type: "streak",
        title: "7-day learning streak",
        description: "Learn something new for 7 consecutive days",
        progress: Math.min(100, (sessionStats.currentStreak / 7) * 100),
        target: 7,
        current: sessionStats.currentStreak,
      });
    }

    if (progressStats.totalTimeSpent < 300) {
      nextMilestones.push({
        type: "time",
        title: "5 hours of learning",
        description: "Spend 300 minutes learning music",
        progress: Math.min(100, (progressStats.totalTimeSpent / 300) * 100),
        target: 300,
        current: progressStats.totalTimeSpent,
      });
    }

    console.log("Final overview stats:", {
      totalEnrolled,
      totalCourses: enrolledCourses.length,
      totalTutorials: enrolledTutorials.length,
      totalCompleted,
      averageProgress: Math.round(progressStats.averageProgress || 0),
      totalTimeSpent: progressStats.totalTimeSpent || 0,
      currentStreak: sessionStats.currentStreak || 0,
      totalAchievements: completedAchievements.length,
    });

    res.json({
      success: true,
      data: {
        // User overview
        overview: {
          totalEnrolled: totalEnrolled,
          totalCourses: enrolledCourses.length,
          totalTutorials: enrolledTutorials.length,
          totalCompleted: totalCompleted,
          averageProgress: Math.round(progressStats.averageProgress || 0),
          totalTimeSpent: progressStats.totalTimeSpent || 0,
          currentStreak: sessionStats.currentStreak || 0,
          totalAchievements: completedAchievements.length,
        },

        // Enrolled content with progress
        enrolledContent: {
          courses: enrolledCourses,
          tutorials: enrolledTutorials,
          recentlyAccessed: [...enrolledCourses, ...enrolledTutorials]
            .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
            .slice(
              0,
              Math.max(
                6,
                enrolledCourses.length + enrolledTutorials.length >= 3 ? 3 : 6
              )
            ),
        },

        // Learning analytics
        analytics: {
          progressStats,
          sessionStats,
          categoryStats,
          streakHistory,
          recentActivity,
        },

        // Achievements
        achievements: {
          total: completedAchievements.length,
          recent: recentAchievements,
          nextMilestones,
        },

        // Recommendations
        recommendations: {
          courses: recommendedCourses,
          tutorials: recommendedTutorials,
        },
      },
    });
  } catch (err) {
    console.error("Dashboard data error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/dashboard/activity-chart - Get activity data for charts
router.get("/activity-chart", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const streakHistory = await UserSession.getStreakHistory(userId, days);

    // Format data for charts
    const chartData = streakHistory.map((day) => ({
      date: day.date.toISOString().split("T")[0],
      timeSpent: day.timeSpent,
      activitiesCount: day.activitiesCount,
      hasActivity: day.hasActivity,
    }));

    res.json({
      success: true,
      data: chartData,
    });
  } catch (err) {
    console.error("Activity chart error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
