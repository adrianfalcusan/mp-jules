const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const BunnyCDNService = require("./services/bunnycdn.service");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/music-platform", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Course = require("./models/Course");
const bunnyService = new BunnyCDNService();

async function migrateToBunnyCDN() {
  try {
    console.log("🚀 Starting migration to Bunny CDN...");
    
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to migrate`);
    
    for (const course of courses) {
      console.log(`\n������ Processing course: ${course.title}`);
      
      // Migrate course thumbnail
      if (course.thumbnail && course.thumbnail.startsWith("/uploads/")) {
        const localPath = path.join(__dirname, course.thumbnail);
        if (fs.existsSync(localPath)) {
          try {
            const fileBuffer = fs.readFileSync(localPath);
            const bunnyUrl = await bunnyService.uploadFile(
              fileBuffer,
              `thumbnails/${path.basename(course.thumbnail)}`,
              "image/jpeg"
            );
            course.thumbnail = bunnyUrl;
            console.log(`��� Migrated thumbnail: ${bunnyUrl}`);
          } catch (error) {
            console.error(`��� Failed to migrate thumbnail: ${error.message}`);
          }
        }
      }
      
      // Migrate lesson videos and materials
      if (course.lessons && course.lessons.length > 0) {
        for (const lesson of course.lessons) {
          console.log(`  ���� Processing lesson: ${lesson.title}`);
          
          // Migrate lesson video
          if (lesson.videoUrl && lesson.videoUrl.startsWith("http://localhost:8080/uploads/")) {
            const localPath = path.join(__dirname, "uploads", path.basename(lesson.videoUrl));
            if (fs.existsSync(localPath)) {
              try {
                const fileBuffer = fs.readFileSync(localPath);
                const bunnyUrl = await bunnyService.uploadFile(
                  fileBuffer,
                  `videos/${path.basename(lesson.videoUrl)}`,
                  "video/mp4"
                );
                lesson.videoUrl = bunnyUrl;
                lesson.videoProvider = "bunnycdn";
                console.log(`    ��� Migrated video: ${bunnyUrl}`);
              } catch (error) {
                console.error(`    ��� Failed to migrate video: ${error.message}`);
              }
            }
          }
          
          // Migrate lesson materials
          if (lesson.materials) {
            // Migrate multitracks
            if (lesson.materials.multitracks) {
              for (const multitrack of lesson.materials.multitracks) {
                if (multitrack.url && multitrack.url.startsWith("http://localhost:8080/uploads/")) {
                  const localPath = path.join(__dirname, "uploads", path.basename(multitrack.url));
                  if (fs.existsSync(localPath)) {
                    try {
                      const fileBuffer = fs.readFileSync(localPath);
                      const bunnyUrl = await bunnyService.uploadFile(
                        fileBuffer,
                        `audio/${path.basename(multitrack.url)}`,
                        "audio/mpeg"
                      );
                      multitrack.url = bunnyUrl;
                      console.log(`    ��� Migrated multitrack: ${bunnyUrl}`);
                    } catch (error) {
                      console.error(`    ��� Failed to migrate multitrack: ${error.message}`);
                    }
                  }
                }
              }
            }
            
            // Migrate PDFs
            if (lesson.materials.pdfs) {
              for (const pdf of lesson.materials.pdfs) {
                if (pdf.url && pdf.url.startsWith("http://localhost:8080/uploads/")) {
                  const localPath = path.join(__dirname, "uploads", path.basename(pdf.url));
                  if (fs.existsSync(localPath)) {
                    try {
                      const fileBuffer = fs.readFileSync(localPath);
                      const bunnyUrl = await bunnyService.uploadFile(
                        fileBuffer,
                        `documents/${path.basename(pdf.url)}`,
                        "application/pdf"
                      );
                      pdf.url = bunnyUrl;
                      console.log(`    ��� Migrated PDF: ${bunnyUrl}`);
                    } catch (error) {
                      console.error(`    ��� Failed to migrate PDF: ${error.message}`);
                    }
                  }
                }
              }
            }
            
            // Migrate resources
            if (lesson.materials.resources) {
              for (const resource of lesson.materials.resources) {
                if (resource.url && resource.url.startsWith("http://localhost:8080/uploads/")) {
                  const localPath = path.join(__dirname, "uploads", path.basename(resource.url));
                  if (fs.existsSync(localPath)) {
                    try {
                      const fileBuffer = fs.readFileSync(localPath);
                      const bunnyUrl = await bunnyService.uploadFile(
                        fileBuffer,
                        `resources/${path.basename(resource.url)}`,
                        "application/octet-stream"
                      );
                      resource.url = bunnyUrl;
                      console.log(`    ��� Migrated resource: ${bunnyUrl}`);
                    } catch (error) {
                      console.error(`    ��� Failed to migrate resource: ${error.message}`);
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      // Save the updated course
      await course.save();
      console.log(`��� Saved course: ${course.title}`);
    }
    
    console.log("\n���� Migration to Bunny CDN completed!");
    process.exit(0);
  } catch (error) {
    console.error("��� Migration failed:", error);
    process.exit(1);
  }
}

migrateToBunnyCDN();
