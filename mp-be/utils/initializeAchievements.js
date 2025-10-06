const { AchievementDefinition } = require("../models/Achievement");

const defaultAchievements = [
  {
    name: "First Steps",
    description: "Complete your first tutorial",
    category: "completion",
    criteria: {
      type: "tutorials_completed",
      value: 1,
    },
    points: 10,
    icon: "🎯",
  },
  {
    name: "Learning Enthusiast",
    description: "Complete 5 tutorials",
    category: "completion",
    criteria: {
      type: "tutorials_completed",
      value: 5,
    },
    points: 50,
    icon: "📚",
  },
  {
    name: "Course Pioneer",
    description: "Complete your first course",
    category: "completion",
    criteria: {
      type: "courses_completed",
      value: 1,
    },
    points: 25,
    icon: "🚀",
  },
  {
    name: "Dedicated Learner",
    description: "Complete 3 courses",
    category: "completion",
    criteria: {
      type: "courses_completed",
      value: 3,
    },
    points: 100,
    icon: "🏆",
  },
  {
    name: "Music Explorer",
    description: "Try tutorials from different categories",
    category: "special",
    criteria: {
      type: "special",
      value: 3,
    },
    points: 75,
    icon: "🎵",
  },
];

async function initializeAchievements() {
  try {
    for (const achievement of defaultAchievements) {
      const exists = await AchievementDefinition.findOne({
        name: achievement.name,
      });
      if (!exists) {
        await AchievementDefinition.create(achievement);
        console.log(`✅ Created achievement: ${achievement.name}`);
      }
    }
    console.log("Achievement initialization complete");
  } catch (error) {
    console.error("Error initializing achievements:", error);
  }
}

module.exports = initializeAchievements;
