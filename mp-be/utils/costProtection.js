// utils/costProtection.js
const logger = require("./logger");

class CostProtectionManager {
  constructor() {
    this.dailyBudgets = {
      free: 0.1, // $0.10 per free user per day max
      basic: 0.2, // $0.20 per basic user per day max
      pro: 0.4, // $0.40 per pro user per day max
      premium: 0.8, // $0.80 per premium user per day max
    };

    this.usageLimits = {
      free: {
        dailyBandwidth: 0.5, // GB per day
        concurrentStreams: 1,
        maxQuality: "480p",
        downloadStorage: 0,
      },
      basic: {
        dailyBandwidth: 2, // GB per day
        concurrentStreams: 2,
        maxQuality: "720p",
        downloadStorage: 0.1, // GB
      },
      pro: {
        dailyBandwidth: 10, // GB per day
        concurrentStreams: 3,
        maxQuality: "1080p",
        downloadStorage: 1, // GB
      },
      premium: {
        dailyBandwidth: 50, // GB per day
        concurrentStreams: 5,
        maxQuality: "4k",
        downloadStorage: 10, // GB
      },
    };

    this.costPerGB = 0.01; // Bunny CDN pricing
    this.emergencyMode = false;
  }

  /**
   * Check if user can stream based on their tier and usage
   */
  async canUserStream(userId, userTier, currentUsage) {
    const limits = this.usageLimits[userTier];
    const today = new Date().toISOString().split("T")[0];

    // Check daily bandwidth limit
    const todayUsage = currentUsage[today] || 0;
    if (todayUsage >= limits.dailyBandwidth) {
      return {
        allowed: false,
        reason: "Daily bandwidth limit reached",
        resetTime: this.getNextResetTime(),
        upgradePrompt: this.getUpgradePrompt(userTier),
      };
    }

    // Check concurrent streams
    const activeStreams = await this.getActiveStreams(userId);
    if (activeStreams >= limits.concurrentStreams) {
      return {
        allowed: false,
        reason: "Maximum concurrent streams reached",
        limit: limits.concurrentStreams,
      };
    }

    // Emergency cost protection
    if (this.emergencyMode && userTier === "free") {
      return {
        allowed: false,
        reason: "Service temporarily limited due to high usage",
        upgradePrompt: "Upgrade to continue streaming without interruption",
      };
    }

    return { allowed: true };
  }

  /**
   * Get appropriate video quality for user tier
   */
  getMaxQualityForTier(userTier) {
    return this.usageLimits[userTier].maxQuality;
  }

  /**
   * Progressive quality loading based on engagement
   */
  getVideoQualityStrategy(userTier, watchTime = 0) {
    const maxQuality = this.getMaxQualityForTier(userTier);

    // Always start with 480p to save bandwidth
    if (watchTime < 30) {
      return "480p";
    }

    // Upgrade quality based on engagement and tier
    if (watchTime >= 30 && watchTime < 120) {
      return userTier === "free" ? "480p" : "720p";
    }

    // Full quality after 2 minutes of engagement
    return maxQuality;
  }

  /**
   * Monitor and alert on costs
   */
  async monitorDailyCosts() {
    try {
      const today = new Date();
      const dailyUsage = await this.getDailyUsageStats(today);
      const dailyCost = dailyUsage.totalBandwidth * this.costPerGB;

      // Get subscription revenue for the day
      const dailyRevenue = await this.getDailyRevenue(today);
      const costPercentage = (dailyCost / dailyRevenue) * 100;

      logger.info("Daily cost monitoring", {
        date: today.toISOString().split("T")[0],
        dailyCost: dailyCost.toFixed(2),
        dailyRevenue: dailyRevenue.toFixed(2),
        costPercentage: costPercentage.toFixed(1),
        totalBandwidth: dailyUsage.totalBandwidth.toFixed(2),
      });

      // Alert thresholds
      if (costPercentage > 50) {
        logger.warn("High cost alert", {
          costPercentage: costPercentage.toFixed(1),
          recommendedAction: "Consider enabling cost protection measures",
        });

        if (costPercentage > 75) {
          logger.error("Critical cost alert", {
            costPercentage: costPercentage.toFixed(1),
            action: "Enabling emergency cost protection",
          });
          await this.enableEmergencyMode();
        }
      }

      return {
        dailyCost,
        dailyRevenue,
        costPercentage,
        status:
          costPercentage > 75
            ? "critical"
            : costPercentage > 50
            ? "warning"
            : "ok",
      };
    } catch (error) {
      logger.error("Error monitoring daily costs", { error: error.message });
      throw error;
    }
  }

  /**
   * Enable emergency cost protection
   */
  async enableEmergencyMode() {
    this.emergencyMode = true;

    // Reduce quality for all users
    await this.enforceEmergencyLimits();

    // Send alerts to admin
    await this.sendCostAlert("emergency");

    logger.warn("Emergency cost protection enabled", {
      timestamp: new Date().toISOString(),
      measures: [
        "Free tier streaming limited",
        "All users downgraded to 720p max",
        "Download features temporarily disabled",
      ],
    });
  }

  /**
   * Disable emergency mode
   */
  async disableEmergencyMode() {
    this.emergencyMode = false;
    logger.info("Emergency cost protection disabled");
  }

  /**
   * Enforce emergency cost limits
   */
  async enforceEmergencyLimits() {
    // Temporarily reduce limits for all tiers
    const emergencyLimits = {
      free: { ...this.usageLimits.free, dailyBandwidth: 0.1 },
      basic: { ...this.usageLimits.basic, maxQuality: "480p" },
      pro: { ...this.usageLimits.pro, maxQuality: "720p" },
      premium: { ...this.usageLimits.premium, maxQuality: "1080p" },
    };

    // Apply emergency limits (temporarily override)
    this.emergencyLimits = emergencyLimits;
  }

  /**
   * Get usage statistics for cost calculation
   */
  async getDailyUsageStats(date) {
    // This would integrate with your analytics system
    // For now, return mock data structure
    return {
      totalBandwidth: 0,
      totalRequests: 0,
      userBreakdown: {
        free: { users: 0, bandwidth: 0 },
        basic: { users: 0, bandwidth: 0 },
        pro: { users: 0, bandwidth: 0 },
        premium: { users: 0, bandwidth: 0 },
      },
    };
  }

  /**
   * Get daily revenue from subscriptions
   */
  async getDailyRevenue(date) {
    // This would integrate with your subscription system
    // Calculate daily revenue based on monthly subscriptions
    const monthlyRevenue = await this.getMonthlyRevenue();
    return monthlyRevenue / 30; // Approximate daily revenue
  }

  /**
   * Get monthly subscription revenue
   */
  async getMonthlyRevenue() {
    // This would query your subscription database
    // Return mock value for now
    return 10000; // $10,000/month
  }

  /**
   * Track user bandwidth usage
   */
  async trackBandwidthUsage(userId, userTier, bytesTransferred) {
    const gbTransferred = bytesTransferred / (1024 * 1024 * 1024);
    const today = new Date().toISOString().split("T")[0];

    // Update user's daily usage
    await this.updateUserUsage(userId, today, gbTransferred);

    // Check if user is approaching limits
    const currentUsage = await this.getUserDailyUsage(userId, today);
    const limits = this.usageLimits[userTier];

    if (currentUsage >= limits.dailyBandwidth * 0.8) {
      return {
        warning: true,
        message: `You've used ${(
          (currentUsage * 100) /
          limits.dailyBandwidth
        ).toFixed(0)}% of your daily limit`,
        upgradePrompt: this.getUpgradePrompt(userTier),
      };
    }

    return { warning: false };
  }

  /**
   * Get upgrade prompt based on current tier
   */
  getUpgradePrompt(currentTier) {
    const upgrades = {
      free: {
        tier: "basic",
        price: "$4.99/month",
        benefits: ["Unlimited tutorials", "HD quality", "No daily limits"],
      },
      basic: {
        tier: "pro",
        price: "$12.99/month",
        benefits: [
          "Unlimited courses",
          "Full HD quality",
          "Downloads",
          "Live sessions",
        ],
      },
      pro: {
        tier: "premium",
        price: "$24.99/month",
        benefits: ["4K quality", "More live sessions", "Custom learning paths"],
      },
    };

    return upgrades[currentTier] || null;
  }

  /**
   * Get next reset time for daily limits
   */
  getNextResetTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Utility methods (would integrate with your database)
   */
  async getActiveStreams(userId) {
    // Query active streaming sessions for user
    return 0;
  }

  async updateUserUsage(userId, date, gbUsed) {
    // Update user's daily usage in database
  }

  async getUserDailyUsage(userId, date) {
    // Get user's usage for specific date
    return 0;
  }

  async sendCostAlert(level) {
    // Send alert to admin dashboard/email
    logger.warn(`Cost alert sent: ${level}`);
  }
}

module.exports = CostProtectionManager;
