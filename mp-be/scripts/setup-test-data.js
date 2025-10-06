const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Load environment variables
require("dotenv").config();

async function setupTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if test user already exists
    const existingUser = await User.findOne({ email: "teacher@test.com" });

    if (existingUser) {
      console.log("✅ Test user already exists");
      console.log("   Email: teacher@test.com");
      console.log("   Password: password123");
      console.log("   Role:", existingUser.role);
    } else {
      // Create test teacher user
      const hashedPassword = await bcrypt.hash("password123", 12);

      const testUser = new User({
        name: "Test Teacher",
        email: "teacher@test.com",
        password: hashedPassword,
        role: "teacher",
        isEmailVerified: true,
        subscriptionTier: "basic", // Give them basic tier for testing
      });

      await testUser.save();
      console.log("✅ Test user created successfully!");
      console.log("   Email: teacher@test.com");
      console.log("   Password: password123");
      console.log("   Role: teacher");
      console.log("   Subscription: basic");
    }

    // Create test student user
    const existingStudent = await User.findOne({ email: "student@test.com" });

    if (!existingStudent) {
      const hashedPassword = await bcrypt.hash("password123", 12);

      const testStudent = new User({
        name: "Test Student",
        email: "student@test.com",
        password: hashedPassword,
        role: "student",
        isEmailVerified: true,
        subscriptionTier: "free",
      });

      await testStudent.save();
      console.log("✅ Test student created successfully!");
      console.log("   Email: student@test.com");
      console.log("   Password: password123");
      console.log("   Role: student");
      console.log("   Subscription: free");
    } else {
      console.log("✅ Test student already exists");
    }

    console.log("\n🎉 Test data setup complete!");
    console.log("\n📝 You can now use these credentials for testing:");
    console.log("   Teacher: teacher@test.com / password123");
    console.log("   Student: student@test.com / password123");
  } catch (error) {
    console.error("❌ Error setting up test data:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

setupTestData();
