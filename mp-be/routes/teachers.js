// routes/teachers.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");
const Enrollment = require("../models/Enrollment");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

/**
 * GET /api/teachers - Get all teachers
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const teachers = await User.find({ role: "teacher" })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: "teacher" });

    res.json({
      success: true,
      teachers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: teachers.length,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/teachers/analytics/dashboard - Get teacher dashboard analytics
 */
router.get(
  "/analytics/dashboard",
  auth,
  role(["teacher", "admin"]),
  async (req, res) => {
    try {
      const teacherId = req.user.id;

      // Get teacher's courses and tutorials
      const [courses, tutorials] = await Promise.all([
        Course.find({ teacher: teacherId }),
        Tutorial.find({ teacher: teacherId }),
      ]);

      // Calculate overview metrics
      const totalCourses = courses.length;
      const totalTutorials = tutorials.length;

      // Get enrollment counts for courses
      const courseEnrollments = await Enrollment.find({
        itemId: { $in: courses.map((c) => c._id) },
        itemType: "course",
      });

      // Get enrollment counts for tutorials
      const tutorialEnrollments = await Enrollment.find({
        itemId: { $in: tutorials.map((t) => t._id) },
        itemType: "tutorial",
      });

      const totalStudents =
        courseEnrollments.length + tutorialEnrollments.length;

      // Calculate revenue
      let totalRevenue = 0;
      courseEnrollments.forEach((enrollment) => {
        const course = courses.find(
          (c) => c._id.toString() === enrollment.itemId.toString()
        );
        if (course) totalRevenue += course.price;
      });
      tutorialEnrollments.forEach((enrollment) => {
        const tutorial = tutorials.find(
          (t) => t._id.toString() === enrollment.itemId.toString()
        );
        if (tutorial) totalRevenue += tutorial.price;
      });

      // Generate chart data for last 6 months
      const chartData = [];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        // Get enrollments for this month
        const monthlyEnrollments = await Enrollment.find({
          itemId: {
            $in: [...courses.map((c) => c._id), ...tutorials.map((t) => t._id)],
          },
          createdAt: { $gte: monthStart, $lte: monthEnd },
        });

        let monthlyRevenue = 0;
        monthlyEnrollments.forEach((enrollment) => {
          const course = courses.find(
            (c) => c._id.toString() === enrollment.itemId.toString()
          );
          const tutorial = tutorials.find(
            (t) => t._id.toString() === enrollment.itemId.toString()
          );
          if (course) monthlyRevenue += course.price;
          if (tutorial) monthlyRevenue += tutorial.price;
        });

        chartData.push({
          month: months[5 - i] || "Month",
          students: monthlyEnrollments.length,
          revenue: monthlyRevenue,
        });
      }

      // Get top performing content
      const topCourses = courses
        .map((course) => ({
          ...course.toObject(),
          enrollmentCount: courseEnrollments.filter(
            (e) => e.itemId.toString() === course._id.toString()
          ).length,
        }))
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 3);

      const analytics = {
        overview: {
          totalCourses,
          totalTutorials,
          totalStudents,
          totalRevenue,
        },
        chartData,
        topPerforming: topCourses,
      };

      res.json({ success: true, analytics });
    } catch (error) {
      console.error("Error fetching teacher analytics:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/**
 * GET /api/teachers/my-courses - Get teacher's courses
 */
router.get(
  "/my-courses",
  auth,
  role(["teacher", "admin"]),
  async (req, res) => {
    try {
      const teacherId = req.user.id;

      const courses = await Course.find({ teacher: teacherId })
        .populate("teacher", "name email")
        .sort({ createdAt: -1 });

      // Add enrollment count to each course
      for (let course of courses) {
        const enrollmentCount = await Enrollment.countDocuments({
          itemId: course._id,
          itemType: "course",
        });
        course.enrollmentCount = enrollmentCount;
      }

      res.json({ success: true, courses });
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/**
 * GET /api/teachers/my-tutorials - Get teacher's tutorials
 */
router.get(
  "/my-tutorials",
  auth,
  role(["teacher", "admin"]),
  async (req, res) => {
    try {
      const teacherId = req.user.id;

      const tutorials = await Tutorial.find({ teacher: teacherId })
        .populate("teacher", "name email")
        .sort({ createdAt: -1 });

      // Add purchase count to each tutorial
      for (let tutorial of tutorials) {
        const purchaseCount = await Enrollment.countDocuments({
          itemId: tutorial._id,
          itemType: "tutorial",
        });
        tutorial.purchaseCount = purchaseCount;
      }

      res.json({ success: true, tutorials });
    } catch (error) {
      console.error("Error fetching teacher tutorials:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/**
 * GET /api/teachers/highlights
 * Return teacher docs with totalEnrollments based on Enrollment itemType references
 */
router.get("/highlights", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;

    const pipeline = [
      { $match: { role: "teacher" } },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "teacher",
          as: "teacherCourses",
        },
      },
      {
        $lookup: {
          from: "tutorials",
          localField: "_id",
          foreignField: "teacher",
          as: "teacherTutorials",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          courseIds: {
            $map: { input: "$teacherCourses", as: "c", in: "$$c._id" },
          },
          tutorialIds: {
            $map: { input: "$teacherTutorials", as: "t", in: "$$t._id" },
          },
        },
      },
      {
        $lookup: {
          from: "enrollments",
          let: { courses: "$courseIds", tutorials: "$tutorialIds" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ["$itemType", "course"] },
                        { $in: ["$itemId", "$$courses"] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ["$itemType", "tutorial"] },
                        { $in: ["$itemId", "$$tutorials"] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "teacherEnrollments",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalEnrollments: { $size: "$teacherEnrollments" },
        },
      },
      { $sort: { totalEnrollments: -1 } },
      { $limit: limit },
    ];

    const teacherStats = await User.aggregate(pipeline);

    res.json({ success: true, teachers: teacherStats });
  } catch (err) {
    console.error("Teacher highlights error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * (Optional) GET /api/teachers/ranking
 * If you want more advanced aggregator combining rating from "reviews" as well
 */
// ... you can do a bigger aggregator or you can do the loop approach

/**
 * GET /api/teachers/:id - Get teacher by ID
 * NOTE: This route MUST come last to avoid conflicts with specific routes
 */
router.get("/:id", async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: "teacher",
    }).select("name email createdAt");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({ success: true, teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
