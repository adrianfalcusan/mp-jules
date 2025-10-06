const mongoose = require("mongoose");
const Course = require("./models/Course");

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/music-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateExistingCourses() {
  try {
    console.log("Updating existing courses to use local storage...");
    
    // Find courses with Bunny CDN URLs
    const courses = await Course.find({
      "lessons.videoUrl": { $regex: "musicloud-cdn.b-cdn.net" }
    });
    
    console.log(`Found ${courses.length} courses with Bunny CDN URLs`);
    
    for (const course of courses) {
      console.log(`\nUpdating course: ${course.title}`);
      
      let updated = false;
      for (const lesson of course.lessons) {
        if (lesson.videoUrl && lesson.videoUrl.includes("musicloud-cdn.b-cdn.net")) {
          // Extract filename from Bunny CDN URL
          const filename = lesson.videoUrl.split("/").pop();
          // Convert to local storage URL
          lesson.videoUrl = `http://localhost:8080/uploads/${filename}`;
          lesson.videoKey = filename;
          updated = true;
          console.log(`  Updated lesson video URL to: ${lesson.videoUrl}`);
        }
      }
      
      if (updated) {
        await course.save();
        console.log(`  ✅ Course "${course.title}" updated successfully`);
      }
    }
    
    console.log("\n✅ All courses updated to use local storage!");
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

updateExistingCourses();
