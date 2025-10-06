const fs = require("fs");
let content = fs.readFileSync("routes/courses.js", "utf8");

// Replace the old course creation route with enhanced version that handles lessons
const oldRoute = `router.post("/", auth, role(["teacher", "admin"]), async (req, res) => {
  try {
    const { title, description, price, image, videoLinks, thumbnail } =
      req.body;
    const course = await Course.create({
      title,
      description,
      price,
      image,
      videoLinks: videoLinks || [],
      thumbnail,
      teacher: req.user.id,
    });
    res.json({ success: true, course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});`;

const newRoute = `router.post("/", auth, role(["teacher", "admin"]), async (req, res) => {
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
});`;

content = content.replace(oldRoute, newRoute);

fs.writeFileSync("routes/courses.js", content);
console.log("Enhanced backend course creation route!");
