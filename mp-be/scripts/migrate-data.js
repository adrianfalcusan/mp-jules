// scripts/migrate-data.js
const mongoose = require("mongoose");
require("dotenv").config();

const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");
const Enrollment = require("../models/Enrollment");
const Review = require("../models/Review");

async function migrateCourseData() {
  console.log("🔄 Migrating course data...");

  const courses = await Course.find({});

  for (const course of courses) {
    let updated = false;

    // Set default values for new fields if they don't exist
    if (!course.duration) {
      course.duration = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
      updated = true;
    }

    if (!course.level) {
      const levels = ["beginner", "intermediate", "advanced"];
      course.level = levels[Math.floor(Math.random() * levels.length)];
      updated = true;
    }

    if (!course.category) {
      // Try to guess category from title/description
      const title = course.title.toLowerCase();
      if (title.includes("piano")) course.category = "piano";
      else if (title.includes("guitar")) course.category = "guitar";
      else if (title.includes("bass")) course.category = "bass";
      else if (title.includes("drum")) course.category = "drums";
      else if (title.includes("vocal") || title.includes("sing"))
        course.category = "vocals";
      else if (title.includes("theory")) course.category = "theory";
      else if (title.includes("production") || title.includes("mix"))
        course.category = "production";
      else course.category = "general";
      updated = true;
    }

    if (course.averageRating === undefined) {
      course.averageRating = 0;
      updated = true;
    }

    if (course.reviewCount === undefined) {
      course.reviewCount = 0;
      updated = true;
    }

    if (course.enrollmentCount === undefined) {
      course.enrollmentCount = 0;
      updated = true;
    }

    if (course.isPublished === undefined) {
      course.isPublished = true;
      updated = true;
    }

    if (updated) {
      await course.save();
      console.log(`✅ Updated course: ${course.title}`);
    }

    // Update calculated fields
    await course.updateEnrollmentCount();
    await course.updateAverageRating();
  }

  console.log(`📊 Migrated ${courses.length} courses`);
}

async function migrateTutorialData() {
  console.log("🔄 Migrating tutorial data...");

  const tutorials = await Tutorial.find({});

  for (const tutorial of tutorials) {
    let updated = false;

    // Set default values for new fields if they don't exist
    if (!tutorial.duration) {
      tutorial.duration = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
      updated = true;
    }

    if (!tutorial.level) {
      const levels = ["beginner", "intermediate", "advanced"];
      tutorial.level = levels[Math.floor(Math.random() * levels.length)];
      updated = true;
    }

    if (!tutorial.category) {
      // Try to guess category from title/description
      const title = tutorial.title.toLowerCase();
      if (title.includes("piano")) tutorial.category = "piano";
      else if (title.includes("guitar")) tutorial.category = "guitar";
      else if (title.includes("bass")) tutorial.category = "bass";
      else if (title.includes("drum")) tutorial.category = "drums";
      else if (title.includes("vocal") || title.includes("sing"))
        tutorial.category = "vocals";
      else if (title.includes("theory")) tutorial.category = "theory";
      else if (title.includes("production") || title.includes("mix"))
        tutorial.category = "production";
      else tutorial.category = "general";
      updated = true;
    }

    if (tutorial.averageRating === undefined) {
      tutorial.averageRating = 0;
      updated = true;
    }

    if (tutorial.reviewCount === undefined) {
      tutorial.reviewCount = 0;
      updated = true;
    }

    if (tutorial.purchaseCount === undefined) {
      tutorial.purchaseCount = 0;
      updated = true;
    }

    if (tutorial.viewCount === undefined) {
      tutorial.viewCount = 0;
      updated = true;
    }

    if (tutorial.isPublished === undefined) {
      tutorial.isPublished = true;
      updated = true;
    }

    if (updated) {
      await tutorial.save();
      console.log(`✅ Updated tutorial: ${tutorial.title}`);
    }

    // Update calculated fields
    await tutorial.updatePurchaseCount();
  }

  console.log(`📊 Migrated ${tutorials.length} tutorials`);
}

async function main() {
  try {
    console.log("🚀 Starting data migration...");

    await mongoose.connect(process.env.DB_URI);
    console.log("📦 Connected to MongoDB");

    await migrateCourseData();
    await migrateTutorialData();

    console.log("✨ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateCourseData, migrateTutorialData };
