// scripts/enroll-test-tutorial.js
const mongoose = require("mongoose");
require("dotenv").config();

// Import all models to register them
require("../models/Tutorial");
require("../models/Enrollment");
require("../models/User");

const Tutorial = require("../models/Tutorial");
const Enrollment = require("../models/Enrollment");

async function enrollTestTutorial() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected to MongoDB");

    // Find the test tutorial
    const testTutorial = await Tutorial.findOne({
      title: "Test Video Tutorial (MP4)",
    });
    if (!testTutorial) {
      console.error("Test tutorial not found");
      return;
    }

    // Find a user to enroll (use the first user found)
    const user = await mongoose.model("User").findOne({});
    if (!user) {
      console.error("No users found");
      return;
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      student: user._id,
      itemType: "tutorial",
      itemId: testTutorial._id,
    });

    if (existingEnrollment) {
      console.log("Enrollment already exists for this user and tutorial");
      return;
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: user._id,
      itemType: "tutorial",
      itemId: testTutorial._id,
      enrolledAt: new Date(),
      status: "active",
    });

    await enrollment.save();
    console.log("Enrollment created successfully:");
    console.log(`  Student: ${user._id}`);
    console.log(`  Tutorial: ${testTutorial._id}`);
    console.log(`  Tutorial Title: ${testTutorial.title}`);
  } catch (error) {
    console.error("Error creating enrollment:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
enrollTestTutorial();
