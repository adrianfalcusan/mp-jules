// STREAMLINED COURSE CREATION WITH VIDEO UPLOAD
const express = require("express");
const {
  uploadVideo,
  uploadVideoToBunny,
} = require("../middlewares/uploadVideoBunny");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");

const router = express.Router();

// CREATE COURSE WITH VIDEO IN ONE STEP
router.post(
  "/create-with-video",
  auth,
  role(["teacher", "admin"]),
  uploadVideo, // Handle video upload
  uploadVideoToBunny, // Upload to Bunny CDN
  async (req, res) => {
    try {
      const { title, description, price, category, difficulty } = req.body;
      const uploadResult = req.bunnyUpload;

      if (!uploadResult || !uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: "Video upload failed",
        });
      }

      // Create course with video data
      const course = new Course({
        title,
        description,
        price: parseFloat(price) || 0,
        category: category || "Music",
        difficulty: difficulty || "Beginner",
        teacher: req.user.id,
        bunnyVideoUrl: uploadResult.videoUrl,
        bunnyThumbnailUrl: uploadResult.thumbnailUrl,
        bunnyVideoQualities: uploadResult.qualities || ["original"],
        videoDuration: uploadResult.duration || 0,
        videoProcessed: true,
        videoProvider: "bunnycdn",
        isPublished: false, // Require manual approval
        createdAt: new Date(),
        videoKey: uploadResult.videoKey,
      });

      await course.save();

      res.json({
        success: true,
        message: "Course created successfully! Pending approval.",
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          price: course.price,
          category: course.category,
          difficulty: course.difficulty,
          videoUrl: course.bunnyVideoUrl,
          isPublished: course.isPublished,
          status: "pending_approval",
        },
      });
    } catch (error) {
      console.error("Course creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create course",
        error: error.message,
      });
    }
  }
);

// CREATE TUTORIAL WITH VIDEO IN ONE STEP
router.post(
  "/tutorial/create-with-video",
  auth,
  role(["teacher", "admin"]),
  uploadVideo,
  uploadVideoToBunny,
  async (req, res) => {
    try {
      const { title, description, price, category, difficulty, duration } =
        req.body;
      const uploadResult = req.bunnyUpload;

      if (!uploadResult || !uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: "Video upload failed",
        });
      }

      const tutorial = new Tutorial({
        title,
        description,
        price: parseFloat(price) || 0,
        category: category || "Music",
        difficulty: difficulty || "Beginner",
        teacher: req.user.id,
        bunnyVideoUrl: uploadResult.videoUrl,
        bunnyThumbnailUrl: uploadResult.thumbnailUrl,
        bunnyVideoQualities: uploadResult.qualities || ["original"],
        videoDuration: uploadResult.duration || parseInt(duration) || 0,
        videoProcessed: true,
        videoProvider: "bunnycdn",
        isPublished: false, // Require manual approval
        createdAt: new Date(),
        videoKey: uploadResult.videoKey,
      });

      await tutorial.save();

      res.json({
        success: true,
        message: "Tutorial created successfully! Pending approval.",
        tutorial: {
          id: tutorial._id,
          title: tutorial.title,
          description: tutorial.description,
          price: tutorial.price,
          category: tutorial.category,
          difficulty: tutorial.difficulty,
          videoUrl: tutorial.bunnyVideoUrl,
          isPublished: tutorial.isPublished,
          status: "pending_approval",
        },
      });
    } catch (error) {
      console.error("Tutorial creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create tutorial",
        error: error.message,
      });
    }
  }
);

module.exports = router;
