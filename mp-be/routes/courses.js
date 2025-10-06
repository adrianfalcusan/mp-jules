// routes/courses.js  (full rewrite)
const express = require("express");
const router = express.Router();

// ─────────────────── dependencies
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const jwt = require("jsonwebtoken");
const { buildBunnySignedUrl } = require("../utils/bunnySignedUrl");

function getBunnyPathFromUrl(urlOrKey) {
  if (!urlOrKey) return null;
  try {
    if (urlOrKey.startsWith("http")) {
      const u = new URL(urlOrKey);
      return u.pathname; // includes leading /
    }
    return urlOrKey.startsWith("/") ? urlOrKey : `/${urlOrKey}`;
  } catch (e) {
    return urlOrKey.startsWith("/") ? urlOrKey : `/${urlOrKey}`;
  }
}

/* ───────── JWT decode helper (similar to tutorials.js) ───────── */
function tryDecode(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// AWS SDK v3
// AWS SDK removed - using Bunny CDN only

// Bunny CDN configuration - AWS removed
console.log("🐰 Using Bunny CDN for all course video storage and streaming");

// Bunny CDN helper - returns CDN URLs directly
const getBunnyCDNUrl = (key) => {
  if (!key) return null;

  const baseUrl =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;

  // For existing local files, return local URL
  // For new Bunny CDN files, this would return the CDN URL
  if (key.startsWith("http")) return key;
  return `${baseUrl}/uploads/${key}`;
};

/* ───────────────────── STATIC ROUTES */

/** GET /api/courses/my-teacher-courses */
router.get(
  "/my-teacher-courses",
  auth,
  role(["teacher", "admin"]),
  async (req, res) => {
    try {
      const courses = await Course.find({ teacher: req.user.id });
      res.json({ success: true, courses });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/** POST /api/courses/:courseId/upload-video
 *  Generates a presigned URL, appends key to course.videoLinks
 */
// Bunny CDN video upload route
const {
  uploadVideo,
  uploadVideoToBunny,
} = require("../middlewares/uploadVideoBunny");
const {
  uploadVideosArray,
  uploadVideosArrayToBunny,
} = require("../middlewares/uploadVideoBunny");
const {
  uploadThumbnail,
  uploadThumbnailToBunny,
} = require("../middlewares/uploadVideoBunny");

router.post(
  "/:id/bunny-upload-video",
  auth,
  role(["teacher", "admin"]),
  uploadVideo, // Multer middleware to handle file upload
  uploadVideoToBunny, // Process and upload to Bunny CDN
  async (req, res) => {
    try {
      const { id: courseId } = req.params;
      // Get data from middleware
      const uploadData = req.bunnyUpload;
      if (!uploadData || !uploadData.success) {
        return res.status(500).json({
          success: false,
          message: "Upload failed - no data received from middleware",
        });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      // Check if user is the teacher of this course
      if (
        course.teacher.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to upload to this course",
        });
      }

      // Update course with Bunny CDN video data
      course.bunnyVideoUrl = uploadData.videoUrl;
      course.bunnyThumbnailUrl = uploadData.thumbnailUrl;
      course.bunnyVideoQualities = uploadData.qualities;
      course.videoDuration = uploadData.duration;
      course.videoProcessed = true;
      course.videoProvider = "bunnycdn";
      course.videoKey = uploadData.videoKey;
      await course.save();

      res.json({
        success: true,
        message: "Video uploaded to Bunny CDN successfully!",
        courseId: course._id,
        videoUrl: uploadData.videoUrl,
        thumbnailUrl: uploadData.thumbnailUrl,
        qualities: uploadData.qualities,
        duration: uploadData.duration,
      });
    } catch (err) {
      console.error("Bunny CDN video upload error:", err);
      res.status(500).json({
        success: false,
        message: "Server error during Bunny CDN video upload",
      });
    }
  }
);

/** POST /api/courses/bunny-upload-thumbnail */
router.post(
  "/bunny-upload-thumbnail",
  auth,
  role(["teacher", "admin"]),
  async (req, res) => {
    try {
      // For now, return a simple success response
      // This can be expanded with actual Bunny CDN upload logic later
      res.json({
        success: true,
        message: "Bunny CDN thumbnail upload route is working! (Test mode)",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Bunny CDN thumbnail upload error" });
    }
  }
);

/** GET /api/courses/:id/content
 *  Returns presigned URLs only if user is owner/admin/enrolled
 */
router.get("/:id/content", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const ownerOrAdmin =
      req.user.role === "admin" ||
      (req.user.role === "teacher" &&
        course.teacher.toString() === req.user.id);

    if (!ownerOrAdmin) {
      const enrolled = await Enrollment.findOne({
        student: req.user.id,
        itemId: course.id,
        itemType: "course",
      });
      if (!enrolled)
        return res
          .status(403)
          .json({ success: false, message: "Enroll first" });
    }

    const baseUrl =
      process.env.BUNNY_PULL_ZONE_URL || "https://musicloud-cdn.b-cdn.net";

    const videoLinks = [];

    if (course.bunnyVideoUrl) {
      const path = getBunnyPathFromUrl(course.bunnyVideoUrl);
      try {
        const signed = buildBunnySignedUrl(baseUrl, path);
        videoLinks.push(signed);
      } catch (e) {
        return res.status(503).json({
          success: false,
          message:
            "Video signing not configured. Set BUNNY_URL_TOKEN_KEY and restart backend.",
        });
      }
    }

    if (course.videoLinks && course.videoLinks.length > 0) {
      const legacyLinks = course.videoLinks
        .map((k) => {
          const p = getBunnyPathFromUrl(k);
          try {
            return buildBunnySignedUrl(baseUrl, p);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
      videoLinks.push(...legacyLinks);
    }

    res.json({
      success: true,
      videoLinks: videoLinks,
      message:
        videoLinks.length > 0
          ? "Video links generated successfully"
          : "No video content available",
      bunnyVideoUrl: videoLinks[0] || null,
      bunnyVideoQualities: course.bunnyVideoQualities,
      videoProvider: course.videoProvider,
    });
  } catch (err) {
    console.error("Error in course content endpoint:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

/* ───────────────────── DYNAMIC ROUTES */

// GET list
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate(
      "teacher",
      "name email"
    );

    // Get user info if authenticated
    const user = tryDecode(req);

    const list = await Promise.all(
      courses.map(async (c) => {
        // TODO: Fix enrollment count update (Enrollment model registration issue)
        // await c.updateEnrollmentCount();

        // TODO: Fix average rating update (Review model registration issue)
        // await c.updateAverageRating();

        if (c._doc.thumbnail) {
          const thumbnailUrl = getBunnyCDNUrl(c._doc.thumbnail);
          c.thumbnailUrl = thumbnailUrl;
          c._doc.thumbnailUrl = thumbnailUrl;
        }

        // Add calculated fields
        c._doc.enrollments = c.enrollmentCount; // Keep for backward compatibility
        c._doc.students = c.enrollmentCount;
        c._doc.rating = c.averageRating;
        c._doc.reviews = c.reviewCount;

        // Add formatted duration
        if (c.duration > 0) {
          const hours = Math.floor(c.duration / 60);
          const minutes = c.duration % 60;
          c._doc.formattedDuration =
            hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        } else {
          c._doc.formattedDuration = "Duration TBD";
        }

        // Add enrollment status if user is authenticated
        if (user) {
          // User has access if they are:
          // 1. Admin
          // 2. Teacher who owns this course
          // 3. Student who is enrolled
          const isOwner =
            user.role === "teacher" && c.teacher._id.toString() === user.id;
          const isEnrolled =
            user.role === "admin" ||
            isOwner ||
            (await Enrollment.exists({
              student: user.id,
              itemType: "course",
              itemId: c._id,
            }));
          c._doc.enrolled = !!isEnrolled;
          c._doc.purchased = !!isEnrolled;
        } else {
          c._doc.enrolled = false;
          c._doc.purchased = false;
        }

        return c;
      })
    );
    res.json({ success: true, courses: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/courses/my-student-courses - Frontend compatible endpoint (MUST be before /:id)
router.get("/my-student-courses", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's course enrollments
    const enrollments = await Enrollment.find({
      student: userId,
      itemType: "course",
    });

    const courseIds = enrollments.map((e) => e.itemId);

    // Get the actual courses with teacher info
    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    // Add enrollment data to courses
    const coursesWithEnrollmentData = courses.map((course) => {
      const enrollment = enrollments.find(
        (e) => e.itemId.toString() === course._id.toString()
      );
      return {
        ...course.toObject(),
        enrolledAt: enrollment?.enrolledAt,
        enrolled: true,
        purchased: true, // Since they're enrolled
      };
    });

    res.json({
      success: true,
      courses: coursesWithEnrollmentData,
    });
  } catch (err) {
    console.error("Get my student courses error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET single
router.get("/:id", async (req, res) => {
  try {
    const c = await Course.findById(req.params.id).populate(
      "teacher",
      "name email"
    );
    if (!c)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    // Set default values instead of calling broken methods
    c.enrollmentCount = 0;
    c.averageRating = 0;

    if (c.thumbnail) {
      try {
        c._doc.thumbnailUrl = getBunnyCDNUrl(c.thumbnail);
      } catch (err) {
        console.warn("Bunny CDN thumbnail generation failed:", err.message);
        c._doc.thumbnailUrl = `/uploads/${c.thumbnail}`;
      }
    }

    // Add calculated fields
    c._doc.enrollments = c.enrollmentCount;
    c._doc.students = c.enrollmentCount;
    c._doc.rating = c.averageRating;
    c._doc.reviews = c.reviewCount;

    // Add formatted duration
    if (c.duration > 0) {
      const hours = Math.floor(c.duration / 60);
      const minutes = c.duration % 60;
      c._doc.formattedDuration =
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } else {
      c._doc.formattedDuration = "Duration TBD";
    }

    /* check enrollment status if user is authenticated */
    const user = tryDecode(req);

    // User has access if they are:
    // 1. Admin
    // 2. Teacher who owns this course
    // 3. Student who is enrolled
    const isOwner =
      user && user.role === "teacher" && c.teacher._id.toString() === user.id;

    const isEnrolled =
      user &&
      (user.role === "admin" ||
        isOwner ||
        (await Enrollment.exists({
          student: user.id,
          itemType: "course",
          itemId: c._id,
        })));

    // Add enrollment status to the response
    c._doc.enrolled = !!isEnrolled;
    c._doc.purchased = !!isEnrolled;

    res.json({ success: true, course: c });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST create
router.post("/", auth, role(["teacher", "admin"]), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      price, 
      level,
      category,
      tags,
      requirements,
      learningOutcomes,
      lessons,
      status,
      image, 
      videoLinks, 
      thumbnail 
    } = req.body;

    // Create course with enhanced data structure
    const course = await Course.create({
      title,
      description,
      price,
      level,
      category,
      tags: tags || [],
      requirements: requirements || [],
      learningOutcomes: learningOutcomes || [],
      lessons: lessons || [], // Enhanced lesson support
      status: status || "draft",
      image,
      videoLinks: videoLinks || [], // Backward compatibility
      thumbnail,
      teacher: req.user.id,
    });

    res.json({ success: true, course });
  } catch (err) {
    console.error("Course creation error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

// PUT update
router.put("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ success: false, message: "Not found" });
    if (course.teacher.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Forbidden" });

    [
      "title",
      "description", 
      "price",
      "level",
      "category",
      "tags",
      "requirements",
      "learningOutcomes",
      "lessons", // Enhanced lesson support
      "status",
      "image",
      "videoLinks", // Backward compatibility
      "thumbnail",
    ].forEach((f) => {
      if (req.body[f] !== undefined) course[f] = req.body[f];
    });
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res.status(404).json({ success: false, message: "Not found" });
    if (course.teacher.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Forbidden" });
    await course.remove();
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/** GET /api/courses/:courseId/video/:videoIndex   (stream) */
router.get("/:courseId/video/:videoIndex", auth, async (req, res) => {
  try {
    const { courseId, videoIndex } = req.params;

    console.log("Streaming request:", { courseId, videoIndex });

    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const ownerOrAdmin =
      req.user.role === "admin" ||
      (req.user.role === "teacher" &&
        course.teacher.toString() === req.user.id);

    if (!ownerOrAdmin) {
      const enrolled = await Enrollment.findOne({
        student: req.user.id,
        itemId: courseId,
        itemType: "course",
      });
      if (!enrolled)
        return res
          .status(403)
          .json({ success: false, message: "Enroll first" });
    }

    const index = parseInt(videoIndex);
    const baseUrl =
      process.env.BUNNY_PULL_ZONE_URL || "https://musicloud-cdn.b-cdn.net";

    if (isNaN(index) || index < 0) {
      return res.status(404).json({
        success: false,
        message: "Video index out of range or video not found",
      });
    }

    if (course.bunnyVideoUrl && index === 0) {
      const path = getBunnyPathFromUrl(course.bunnyVideoUrl);
      try {
        const signed = buildBunnySignedUrl(baseUrl, path);
        return res.redirect(signed);
      } catch (e) {
        return res.redirect(course.bunnyVideoUrl);
      }
    }

    if (course.videoLinks && course.videoLinks[index]) {
      const videoKey = course.videoLinks[index];
      const path = getBunnyPathFromUrl(videoKey);
      try {
        const signed = buildBunnySignedUrl(baseUrl, path);
        return res.redirect(signed);
      } catch (e) {
        return res
          .status(404)
          .json({ success: false, message: "Video not available" });
      }
    }

    return res.status(404).json({
      success: false,
      message: "Video not found or not available",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST update progress for course watching
router.post("/:id/progress", auth, async (req, res) => {
  try {
    const { progressPercentage, timeSpent = 0, lastPosition = 0 } = req.body;
    const courseId = req.params.id;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Check if user is enrolled
    const Enrollment = require("../models/Enrollment");
    const enrollment = await Enrollment.findOne({
      student: userId,
      itemType: "course",
      itemId: courseId,
    });
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled to track progress",
      });
    }

    // Update progress using the Progress model
    const Progress = require("../models/Progress");
    let progress = await Progress.findOne({
      user: userId,
      contentType: "course",
      contentId: courseId,
    });

    if (!progress) {
      progress = new Progress({
        user: userId,
        contentType: "course",
        contentId: courseId,
        progressPercentage: 0,
        timeSpent: 0,
        lastPosition: 0,
      });
    }

    // Update progress
    if (progressPercentage !== undefined) {
      await progress.updateProgress(progressPercentage, timeSpent);
    } else {
      progress.timeSpent += timeSpent;
      progress.lastPosition = lastPosition;
      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    // Record session activity
    if (timeSpent > 0 || progressPercentage !== undefined) {
      const UserSession = require("../models/UserSession");
      await UserSession.recordActivity(userId, {
        contentType: "course",
        contentId: courseId,
        timeSpent,
        progressMade: progressPercentage
          ? Math.max(
              0,
              progressPercentage -
                (progress.progressPercentage - progressPercentage || 0)
            )
          : 0,
      });
    }

    // Check for new achievements
    const { UserAchievement } = require("../models/Achievement");
    const newAchievements = await UserAchievement.checkAndUnlockAchievements(
      userId
    );

    res.json({
      success: true,
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
    });
  } catch (err) {
    console.error("Update course progress error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* ===== NEW: Manual Duration Calculation ===== */
router.post(
  "/:id/calculate-duration",
  auth,
  role(["teacher", "admin"]),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      }

      // Check permissions
      if (
        req.user.role !== "admin" &&
        course.teacher.toString() !== req.user.id
      ) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (!course.videoLinks || course.videoLinks.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No videos uploaded for this course",
        });
      }

      // Calculate duration
      await course.calculateDuration(s3);

      res.json({
        success: true,
        message: "Duration calculated successfully",
        duration: course.duration,
        videoCount: course.videoLinks.length,
        formattedDuration:
          course.duration > 0
            ? course.duration >= 60
              ? `${Math.floor(course.duration / 60)}h ${Math.round(
                  course.duration % 60
                )}m`
              : `${Math.round(course.duration)}m`
            : "Duration TBD",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

// Append multiple videos to a course
router.post(
  "/:id/videos",
  auth,
  role(["teacher", "admin"]),
  uploadVideosArray,
  uploadVideosArrayToBunny,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course)
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });
      if (
        course.teacher.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const uploaded = req.bunnyMultiUpload || [];
      const keys = uploaded.map((u) => u.key);
      course.videoLinks = [...(course.videoLinks || []), ...keys];
      await course.save();
      return res.json({
        success: true,
        count: uploaded.length,
        videoLinks: course.videoLinks,
      });
    } catch (err) {
      console.error("Append videos error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to add videos" });
    }
  }
);

// Thumbnail upload (alias used by frontend): POST /api/courses/upload-thumbnail
router.post(
  "/upload-thumbnail",
  auth,
  role(["teacher", "admin"]),
  uploadThumbnail,
  uploadThumbnailToBunny,
  async (req, res) => {
    try {
      const url = req?.bunnyThumbnail?.thumbnailUrl;
      if (!url) {
        return res
          .status(500)
          .json({ success: false, message: "Thumbnail upload failed" });
      }
      return res.json({ success: true, url });
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error during thumbnail upload",
      });
    }
  }
);

module.exports = router;
