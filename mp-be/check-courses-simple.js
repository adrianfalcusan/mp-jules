const mongoose = require("mongoose");
const Course = require("./models/Course");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/music-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkCourses() {
  try {
    // Get courses without populating to avoid schema issues
    const courses = await Course.find({}, "title lessons").lean();
    console.log("Found courses:");
    courses.forEach((course, index) => {
      console.log(`\nCourse ${index + 1}: ${course.title}`);
      if (course.lessons && course.lessons.length > 0) {
        course.lessons.forEach((lesson, lessonIndex) => {
          console.log(`  Lesson ${lessonIndex + 1}: ${lesson.videoUrl || "No video URL"}`);
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

checkCourses();
