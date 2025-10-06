const mongoose = require("mongoose");
const Course = require("./models/Course");

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/music-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkThumbnailUrls() {
  try {
    const courses = await Course.find({}).select("title thumbnailUrl thumbnail image thumbnailKey").limit(3);
    console.log("Sample courses with thumbnail data:");
    courses.forEach((course, index) => {
      console.log("Course " + (index + 1) + ": " + course.title);
      console.log("  thumbnailUrl:", course.thumbnailUrl);
      console.log("  thumbnail:", course.thumbnail);
      console.log("  image:", course.image);
      console.log("  thumbnailKey:", course.thumbnailKey);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

checkThumbnailUrls();
