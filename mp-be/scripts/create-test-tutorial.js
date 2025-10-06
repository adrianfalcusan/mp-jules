// scripts/create-test-tutorial.js
const mongoose = require("mongoose");
require("dotenv").config();

// Import all models to register them
require("../models/Tutorial");
require("../models/Enrollment");
require("../models/User");

const Tutorial = require("../models/Tutorial");

async function createTestTutorial() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB");

    // Create a test tutorial with the local MP4 file
    const testTutorial = new Tutorial({
      title: "Test Video Tutorial (MP4)",
      description:
        "This is a test tutorial to verify that MP4 videos work correctly in the video player.",
      price: 9.99,
      teacher: "6815dc42b158a2fc10593ea0", // Use an existing teacher ID
      mainVideoUrl: "http://localhost:8080/uploads/1736856696590-1.mp4",
      videoUrl: "http://localhost:8080/uploads/1736856696590-1.mp4",
      isPublished: true,
      status: "published",
      level: "beginner",
      category: "Music",
      duration: 12, // 12 minutes based on the video length
      formattedDuration: "12m",
    });

    await testTutorial.save();
    console.log("Test tutorial created successfully:");
    console.log(`  ID: ${testTutorial._id}`);
    console.log(`  Title: ${testTutorial.title}`);
    console.log(`  mainVideoUrl: ${testTutorial.mainVideoUrl}`);
    console.log(`  videoUrl: ${testTutorial.videoUrl}`);
  } catch (error) {
    console.error("Error creating test tutorial:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
createTestTutorial();
