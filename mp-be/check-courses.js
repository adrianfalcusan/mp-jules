const mongoose = require("mongoose");
const Course = require("./models/Course");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/music-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkCourses() {
  try {
    const courses = await Course.find({}).select("title lessons.videoUrl lessons.videoKey");
    console.log("Found courses with video URLs:");
    courses.forEach((course, index) => {
      console.log(`\nCourse ${index + 1}: ${course.title}`);
      if (course.lessons && course.lessons.length > 0) {
        course.lessons.forEach((lesson, lessonIndex) => {
          console.log(`  Lesson ${lessonIndex + 1}: ${lesson.videoUrl}`);
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
