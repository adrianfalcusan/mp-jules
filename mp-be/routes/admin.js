// routes/admin.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const UserSession = require("../models/UserSession");
const Progress = require("../models/Progress");
const Tutorial = require("../models/Tutorial");

/* ------------------------------------------------------------------ */

router.get("/", auth, role(["admin"]), (_req, res) =>
  res.json({ success: true, message: "Welcome to the admin dashboard!" })
);

/**
 * POST /api/admin/enroll
 * { userId, itemId, itemType }
 * Instant enrollment without payment.
 */
router.post("/enroll", auth, role(["admin"]), async (req, res) => {
  try {
    const { userId, itemId, itemType = "course" } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Check if the item exists
    let item;
    if (itemType === "course") {
      item = await Course.findById(itemId);
    } else if (itemType === "tutorial") {
      item = await Tutorial.findById(itemId);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid itemType" });
    }

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: `${itemType} not found` });

    const exists = await Enrollment.findOne({
      student: userId,
      itemId,
      itemType,
    });
    if (exists)
      return res.json({ success: false, message: "User is already enrolled" });

    const enrollment = await Enrollment.create({
      student: userId,
      itemId,
      itemType,
    });

    res.json({ success: true, message: "Enrolled", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PUT /api/admin/add-video-links
 * { courseId, newLinks: [string] }
 */
router.put("/add-video-links", auth, role(["admin"]), async (req, res) => {
  try {
    const { courseId, newLinks = [] } = req.body;
    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    course.videoLinks.push(...newLinks);
    await course.save();

    res.json({ success: true, message: "Links added", course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/admin/analytics - Get platform analytics
 */
router.get("/analytics", auth, role(["admin"]), async (req, res) => {
  try {
    console.log("Admin analytics request");

    // Get counts
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalTutorials = await Tutorial.countDocuments();
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalStudents = await User.countDocuments({ role: "student" });

    // Get enrollments data
    const totalEnrollments = await Enrollment.countDocuments();

    // Calculate revenue (basic estimation)
    const courses = await Course.find().select("price");
    const tutorials = await Tutorial.find().select("price");
    const courseEnrollments = await Enrollment.find({
      itemType: "course",
    }).populate("itemId");
    const tutorialEnrollments = await Enrollment.find({
      itemType: "tutorial",
    }).populate("itemId");

    let totalRevenue = 0;
    courseEnrollments.forEach((enrollment) => {
      if (enrollment.itemId && enrollment.itemId.price) {
        totalRevenue += enrollment.itemId.price;
      }
    });
    tutorialEnrollments.forEach((enrollment) => {
      if (enrollment.itemId && enrollment.itemId.price) {
        totalRevenue += enrollment.itemId.price;
      }
    });

    // Generate growth rate (mock data for now)
    const growthRate = Math.floor(Math.random() * 20) + 5;

    // Generate chart data based on real enrollment dates
    const now = new Date();
    const chartData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthlyEnrollments = await Enrollment.countDocuments({
        createdAt: { $gte: monthDate, $lt: nextMonth },
      });

      const monthlyUsers = await User.countDocuments({
        createdAt: { $gte: monthDate, $lt: nextMonth },
      });

      chartData.push({
        month: months[5 - i] || "Month",
        users: monthlyUsers,
        enrollments: monthlyEnrollments,
        revenue: monthlyEnrollments * 25, // Estimated average price
      });
    }

    // User type distribution
    const userTypes = [
      { name: "Students", value: totalStudents, color: "#667eea" },
      { name: "Teachers", value: totalTeachers, color: "#f093fb" },
      {
        name: "Admins",
        value: await User.countDocuments({ role: "admin" }),
        color: "#51cf66",
      },
    ];

    const analytics = {
      overview: {
        totalUsers,
        totalCourses,
        totalTutorials,
        totalEnrollments,
        totalRevenue,
        growthRate,
      },
      chartData,
      userTypes,
    };

    res.json({ success: true, analytics });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PUT /api/admin/users/:id - Update user by ID
 */
router.put("/users/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * DELETE /api/admin/users/:id - Delete user by ID
 */
router.delete("/users/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PATCH /api/admin/users/:id/suspend - Suspend/activate user
 */
router.patch("/users/:id/suspend", auth, role(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { suspended } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { suspended: suspended === true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
      message: `User ${suspended ? "suspended" : "activated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user suspension:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/admin/users - Get all users with pagination
 */
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .select("name email role createdAt isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PUT /api/admin/users/:id - Update user
 */
router.put("/users/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role, isActive },
      { new: true, runValidators: true }
    ).select("name email role isActive createdAt");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * DELETE /api/admin/users/:id - Delete user
 */
router.delete("/users/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deletion of admins
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    await User.findByIdAndDelete(id);

    // Also remove user's enrollments
    await Enrollment.deleteMany({ student: id });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/admin/users/:id/suspend - Suspend/Activate user
 */
router.post("/users/:id/suspend", auth, role(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { suspend } = req.body; // true to suspend, false to activate

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: !suspend },
      { new: true }
    ).select("name email role isActive");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user,
      message: `User ${suspend ? "suspended" : "activated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/admin/content/pending - Get content awaiting approval
 */
router.get("/content/pending", auth, role(["admin"]), async (req, res) => {
  try {
    // Get courses pending approval
    const pendingCourses = await Course.find({
      status: { $in: ["pending", "draft"] },
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    // Get tutorials pending approval
    const pendingTutorials = await Tutorial.find({
      status: { $in: ["pending", "draft"] },
    })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      content: {
        courses: pendingCourses,
        tutorials: pendingTutorials,
        total: pendingCourses.length + pendingTutorials.length,
      },
    });
  } catch (error) {
    console.error("Error fetching pending content:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/admin/content/approve - Approve content
 */
router.post("/content/approve", auth, role(["admin"]), async (req, res) => {
  try {
    const { contentId, contentType, action } = req.body; // action: 'approve' or 'reject'

    let content;
    if (contentType === "course") {
      content = await Course.findByIdAndUpdate(
        contentId,
        { status: action === "approve" ? "published" : "rejected" },
        { new: true }
      ).populate("teacher", "name email");
    } else if (contentType === "tutorial") {
      content = await Tutorial.findByIdAndUpdate(
        contentId,
        { status: action === "approve" ? "published" : "rejected" },
        { new: true }
      ).populate("teacher", "name email");
    }

    if (!content) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    }

    res.json({
      success: true,
      content,
      message: `Content ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error updating content status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/admin/tutorials - Get all tutorials with filters
 */
router.get("/tutorials", auth, role(["admin"]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // published, pending, rejected
    const search = req.query.search || "";

    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tutorials = await Tutorial.find(query)
      .populate("teacher", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add S3 URLs for thumbnails
    const tutorialsWithUrls = await Promise.all(
      tutorials.map(async (t) => {
        if (t._doc.thumbnail) {
          try {
            // AWS SDK removed - using Bunny CDN only

            const s3 = new S3Client({
              region: process.env.AWS_REGION,
              credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              },
            });

            t._doc.thumbnailUrl = await getSignedUrl(
              s3,
              new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: t._doc.thumbnail,
              }),
              { expiresIn: 3600 }
            );
          } catch (err) {
            console.warn("S3 thumbnail generation failed:", err.message);
            t._doc.thumbnailUrl = `/uploads/${t._doc.thumbnail}`;
          }
        }
        return t;
      })
    );

    const total = await Tutorial.countDocuments(query);

    res.json({
      success: true,
      tutorials: tutorialsWithUrls,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: tutorials.length,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error fetching tutorials:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/admin/courses - Get all courses with filters
 */
router.get("/courses", auth, role(["admin"]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // published, pending, rejected
    const search = req.query.search || "";

    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const courses = await Course.find(query)
      .populate("teacher", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      courses,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: courses.length,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/admin/platform-stats - Get platform statistics
 */
router.get("/platform-stats", auth, role(["admin"]), async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        active: await User.countDocuments({ isActive: { $ne: false } }),
        teachers: await User.countDocuments({ role: "teacher" }),
        students: await User.countDocuments({ role: "student" }),
      },
      content: {
        courses: await Course.countDocuments(),
        tutorials: await Tutorial.countDocuments(),
        published:
          (await Course.countDocuments({ status: "published" })) +
          (await Tutorial.countDocuments({ status: "published" })),
        pending:
          (await Course.countDocuments({ status: "pending" })) +
          (await Tutorial.countDocuments({ status: "pending" })),
      },
      activity: {
        totalEnrollments: await Enrollment.countDocuments(),
        thisMonth: await Enrollment.countDocuments({
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        }),
      },
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
