// test-real-progress.js - Test Real Progress Tracking
const axios = require("axios");

const API_BASE_URL = "http://localhost:8080/api";

// User credentials (replace with actual user)
const TEST_USER = {
  email: "adrian@falcusan.ro",
  password: "Test123!@#",
};

// Test course ID (replace with actual course)
const TEST_COURSE_ID = "67c19ac27dd18ce9a3ce0d28";

let authToken = "";

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(
      `API Error [${method} ${endpoint}]:`,
      error.response?.data || error.message
    );
    return null;
  }
};

// Step 1: Login and get auth token
const login = async () => {
  console.log("🔐 Logging in...");

  const response = await apiRequest("POST", "/auth/login", TEST_USER);

  if (response && response.success) {
    authToken = response.token;
    console.log("✅ Login successful!");
    console.log(`👤 User: ${response.user.name} (${response.user.role})`);
    return true;
  } else {
    console.log("❌ Login failed");
    return false;
  }
};

// Step 2: Start a learning session
const startSession = async () => {
  console.log("\n📚 Starting learning session...");

  const response = await apiRequest("POST", "/progress/start-session", {
    contentType: "course",
    contentId: TEST_COURSE_ID,
  });

  if (response && response.success) {
    console.log("✅ Session started successfully!");
    console.log(
      `📊 Current Progress: ${response.data.progress.progressPercentage}%`
    );
    console.log(`⏱️  Time Spent: ${response.data.progress.timeSpent} minutes`);
    console.log(
      `📍 Last Position: ${response.data.progress.lastPosition} seconds`
    );
    return response.data.progress;
  } else {
    console.log("❌ Failed to start session");
    return null;
  }
};

// Step 3: Simulate video watching with progress updates
const simulateVideoWatching = async () => {
  console.log("\n🎥 Simulating video watching...");

  const videoLengthSeconds = 300; // 5 minute video
  const updateIntervals = [30, 60, 120, 180, 240, 300]; // Update every 30s, then 1m, 2m, etc.

  for (let i = 0; i < updateIntervals.length; i++) {
    const currentTime = updateIntervals[i];
    const progressPercentage = Math.min(
      (currentTime / videoLengthSeconds) * 100,
      100
    );
    const timeSpentMinutes = Math.round((currentTime / 60) * 10) / 10; // Convert to minutes with 1 decimal

    console.log(
      `\n⏰ ${currentTime}s - Updating progress to ${Math.round(
        progressPercentage
      )}%...`
    );

    const response = await apiRequest("POST", "/progress/update", {
      contentType: "course",
      contentId: TEST_COURSE_ID,
      progressPercentage: progressPercentage,
      timeSpentMinutes: timeSpentMinutes,
      lastPosition: currentTime,
    });

    if (response && response.success) {
      console.log(
        `✅ Progress updated: ${response.data.progress.progressPercentage}%`
      );
      console.log(
        `⏱️  Total time: ${response.data.progress.timeSpent} minutes`
      );

      if (response.data.progress.isCompleted) {
        console.log("🎉 CONTENT COMPLETED!");
        break;
      }
    } else {
      console.log("❌ Failed to update progress");
    }

    // Wait 2 seconds between updates to simulate real-time usage
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

// Step 4: Complete a lesson section
const completeLesson = async () => {
  console.log("\n📖 Completing lesson section...");

  const response = await apiRequest("POST", "/progress/update", {
    contentType: "course",
    contentId: TEST_COURSE_ID,
    progressPercentage: 100,
    sectionId: "lesson-1-intro",
    timeSpentMinutes: 1,
  });

  if (response && response.success) {
    console.log("✅ Lesson section completed!");
    console.log(
      `📚 Completed sections: ${response.data.progress.completedSections.length}`
    );
  } else {
    console.log("❌ Failed to complete lesson");
  }
};

// Step 5: Get user progress stats
const getProgressStats = async () => {
  console.log("\n📊 Getting user progress statistics...");

  const response = await apiRequest("GET", "/progress/user");

  if (response && response.success) {
    console.log("✅ Progress stats retrieved!");
    console.log("\n=== PROGRESS STATISTICS ===");

    const { progressStats, sessionStats, achievements, recentActivity } =
      response.data;

    console.log(`📚 Total Content: ${progressStats.totalContent || 0}`);
    console.log(`✅ Completed: ${progressStats.completedContent || 0}`);
    console.log(
      `📈 Average Progress: ${Math.round(progressStats.averageProgress || 0)}%`
    );
    console.log(`⏱️  Total Time: ${progressStats.totalTimeSpent || 0} minutes`);

    console.log(`\n🔥 Current Streak: ${sessionStats.currentStreak || 0} days`);
    console.log(`📅 Total Learning Days: ${sessionStats.totalDays || 0}`);
    console.log(
      `⚡ Average Time/Day: ${Math.round(
        sessionStats.averageTimePerDay || 0
      )} minutes`
    );

    console.log(`\n🏆 Achievements: ${achievements.length}`);
    achievements.forEach((achievement) => {
      console.log(`   🎖️  ${achievement.name}`);
    });

    console.log(`\n📈 Recent Activity (${recentActivity.length} days):`);
    recentActivity.slice(0, 5).forEach((activity) => {
      const date = new Date(activity.date).toLocaleDateString();
      console.log(
        `   ${date}: ${activity.progressMade || 0}% progress, ${
          activity.timeSpent || 0
        }min`
      );
    });
  } else {
    console.log("❌ Failed to get progress stats");
  }
};

// Step 6: Get learning streak data
const getStreakData = async () => {
  console.log("\n🔥 Getting learning streak data...");

  const response = await apiRequest("GET", "/progress/streak?days=7");

  if (response && response.success) {
    console.log("✅ Streak data retrieved!");
    console.log(`\n🔥 Current Streak: ${response.data.currentStreak} days`);

    console.log("\n📅 Last 7 Days Activity:");
    response.data.streakHistory.forEach((day) => {
      const date = new Date(day.date).toLocaleDateString();
      const status = day.hasActivity ? "✅" : "❌";
      console.log(
        `   ${date}: ${status} (${day.timeSpent}min, ${day.activitiesCount} activities)`
      );
    });
  } else {
    console.log("❌ Failed to get streak data");
  }
};

// Main test function
const runProgressTrackingTest = async () => {
  console.log("🚀 REAL PROGRESS TRACKING TEST");
  console.log("================================\n");

  try {
    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.log("\n❌ Test failed: Could not login");
      return;
    }

    // Step 2: Start session
    const sessionStarted = await startSession();
    if (!sessionStarted) {
      console.log("\n❌ Test failed: Could not start session");
      return;
    }

    // Step 3: Simulate video watching
    await simulateVideoWatching();

    // Step 4: Complete a lesson
    await completeLesson();

    // Step 5: Get progress stats
    await getProgressStats();

    // Step 6: Get streak data
    await getStreakData();

    console.log("\n🎉 PROGRESS TRACKING TEST COMPLETED!");
    console.log("=====================================");
    console.log("\n✨ Key Features Demonstrated:");
    console.log("   📚 Session Management");
    console.log("   📊 Real-time Progress Updates");
    console.log("   🎯 Lesson Completion Tracking");
    console.log("   📈 Progress Statistics");
    console.log("   🔥 Learning Streak Calculation");
    console.log("   ⏱️  Time Tracking");
    console.log("   🏆 Achievement System Ready");
  } catch (error) {
    console.error("\n💥 Test failed with error:", error.message);
  }
};

// Run the test
if (require.main === module) {
  runProgressTrackingTest();
}

module.exports = { runProgressTrackingTest };
