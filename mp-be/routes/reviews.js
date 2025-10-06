// routes/reviews.js
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const rateLimit = require("express-rate-limit");

const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const validate = require("../middlewares/validate");

const Review = require("../models/Review");
const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");
const Enrollment = require("../models/Enrollment");

// Limit review writes – 10 per minute per IP (create/update/delete)
const reviewWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ───── validation schemas */
const reviewSchema = Joi.object({
  itemId: Joi.string().required(),
  itemType: Joi.string().valid("course", "tutorial").required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow("").optional(),
});

const legacyReviewSchema = Joi.object({
  courseId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow("").optional(),
});

/* ───── POST create/update review (new unified endpoint) */
router.post(
  "/",
  auth,
  reviewWriteLimiter,
  role(["student"]),
  validate(reviewSchema),
  async (req, res) => {
    try {
      const { itemId, itemType, rating, comment } = req.body;

      // Check if user is enrolled/purchased the item
      const enrolled = await Enrollment.findOne({
        student: req.user.id,
        itemId,
        itemType,
      });
      if (!enrolled) {
        const itemName = itemType === "course" ? "course" : "tutorial";
        return res.status(403).json({
          success: false,
          message: `You must be enrolled in this ${itemName} to leave a review`,
        });
      }

      // Check if item exists
      const Model = itemType === "course" ? Course : Tutorial;
      const itemExists = await Model.exists({ _id: itemId });
      if (!itemExists) {
        return res.status(404).json({
          success: false,
          message: `${
            itemType.charAt(0).toUpperCase() + itemType.slice(1)
          } not found`,
        });
      }

      // Find existing review or create new one
      const reviewQuery = { student: req.user.id };
      reviewQuery[itemType] = itemId;

      let review = await Review.findOne(reviewQuery);
      if (review) {
        review.rating = rating;
        review.comment = comment || "";
        await review.save();
        await review.populate("student", "name email");
        return res.json({ success: true, message: "Review updated", review });
      }

      // Create new review
      const reviewData = {
        student: req.user.id,
        rating,
        comment: comment || "",
      };
      reviewData[itemType] = itemId;

      review = await Review.create(reviewData);
      await review.populate("student", "name email");
      res.json({ success: true, message: "Review created", review });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* ───── POST create/update course review (legacy endpoint for backward compatibility) */
router.post(
  "/course",
  auth,
  reviewWriteLimiter,
  role(["student"]),
  validate(legacyReviewSchema),
  async (req, res) => {
    try {
      const { courseId, rating, comment } = req.body;

      const enrolled = await Enrollment.findOne({
        student: req.user.id,
        itemId: courseId,
        itemType: "course",
      });
      if (!enrolled)
        return res
          .status(403)
          .json({ success: false, message: "Not enrolled" });

      const courseExists = await Course.exists({ _id: courseId });
      if (!courseExists)
        return res
          .status(404)
          .json({ success: false, message: "Course not found" });

      let review = await Review.findOne({
        course: courseId,
        student: req.user.id,
      });
      if (review) {
        review.rating = rating;
        review.comment = comment || "";
        await review.save();
        await review.populate("student", "name email");
        return res.json({ success: true, message: "Review updated", review });
      }

      review = await Review.create({
        course: courseId,
        student: req.user.id,
        rating,
        comment,
      });
      await review.populate("student", "name email");
      res.json({ success: true, message: "Review created", review });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* ───── GET reviews by item */
router.get("/:itemType/:itemId", async (req, res) => {
  try {
    const { itemType, itemId } = req.params;

    if (!["course", "tutorial"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type. Must be 'course' or 'tutorial'",
      });
    }

    const query = {};
    query[itemType] = itemId;

    const reviews = await Review.find(query)
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ───── GET reviews by course (legacy endpoint) */
router.get("/:courseId", async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ───── GET my review for a specific item */
router.get("/:itemType/:itemId/my-review", auth, async (req, res) => {
  try {
    const { itemType, itemId } = req.params;

    if (!["course", "tutorial"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item type. Must be 'course' or 'tutorial'",
      });
    }

    const query = { student: req.user.id };
    query[itemType] = itemId;

    const review = await Review.findOne(query).populate(
      "student",
      "name email"
    );

    res.json({ success: true, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ───── DELETE review */
router.delete("/:reviewId", auth, reviewWriteLimiter, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user owns the review or is admin
    if (
      review.student.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ───── GET all reviews (for admin or general listing) */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate("student", "name email")
      .populate("course", "title")
      .populate("tutorial", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments();

    res.json({
      success: true,
      reviews,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: reviews.length,
        totalItems: total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
