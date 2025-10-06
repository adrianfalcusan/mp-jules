// ADMIN APPROVAL SYSTEM FOR COURSES AND TUTORIALS
const express = require("express");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");

const router = express.Router();

// GET PENDING CONTENT FOR APPROVAL
router.get("/pending-approval", auth, role(["admin"]), async (req, res) => {
  try {
    const pendingCourses = await Course.find({
      isPublished: false,
      isRejected: { $ne: true },
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    const pendingTutorials = await Tutorial.find({
      isPublished: false,
      isRejected: { $ne: true },
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        courses: pendingCourses.map((course) => ({
          id: course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          price: course.price,
          teacher: course.teacher,
          videoUrl: course.bunnyVideoUrl,
          createdAt: course.createdAt,
          type: "course",
        })),
        tutorials: pendingTutorials.map((tutorial) => ({
          id: tutorial._id,
          title: tutorial.title,
          description: tutorial.description,
          category: tutorial.category,
          difficulty: tutorial.difficulty,
          price: tutorial.price,
          teacher: tutorial.teacher,
          videoUrl: tutorial.bunnyVideoUrl,
          createdAt: tutorial.createdAt,
          type: "tutorial",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching pending content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending content",
    });
  }
});

// APPROVE COURSE
router.post("/approve-course/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    course.isPublished = true;
    course.publishedAt = new Date();
    await course.save();

    res.json({
      success: true,
      message: "Course has been approved and published",
    });
  } catch (error) {
    console.error("Error approving course:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to approve course" });
  }
});

// APPROVE TUTORIAL
router.post(
  "/approve-tutorial/:id",
  auth,
  role(["admin"]),
  async (req, res) => {
    try {
      const tutorial = await Tutorial.findById(req.params.id);
      if (!tutorial) {
        return res
          .status(404)
          .json({ success: false, message: "Tutorial not found" });
      }

      tutorial.isPublished = true;
      tutorial.publishedAt = new Date();
      await tutorial.save();

      res.json({
        success: true,
        message: "Tutorial has been approved and published",
      });
    } catch (error) {
      console.error("Error approving tutorial:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to approve tutorial" });
    }
  }
);

// REJECT CONTENT (course or tutorial)
router.post("/reject/:type/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;

    let item = null;
    if (type === "course") item = await Course.findById(id);
    if (type === "tutorial") item = await Tutorial.findById(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: `${type} not found` });
    }

    item.isRejected = true;
    item.rejectionReason = reason || "No reason provided";
    item.rejectedAt = new Date();
    await item.save();

    res.json({ success: true, message: `${type} has been rejected` });
  } catch (error) {
    console.error("Error rejecting content:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject content" });
  }
});

module.exports = router;
