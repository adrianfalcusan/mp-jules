// models/InstructorRevenue.js
const mongoose = require("mongoose");

const instructorRevenueSchema = new mongoose.Schema(
  {
    // Instructor Information
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Subscription Tier
    subscriptionTier: {
      type: String,
      enum: ["basic", "pro", "premium"],
      default: "basic",
    },

    // Revenue Share Settings
    revenueSharePercentage: {
      type: Number,
      default: function () {
        const rates = {
          basic: 70,
          pro: 80,
          premium: 85,
        };
        return rates[this.subscriptionTier] || 70;
      },
    },

    // Monthly Revenue Tracking
    monthlyRevenue: {
      totalEarned: {
        type: Number,
        default: 0,
      },
      totalViews: {
        type: Number,
        default: 0,
      },
      totalEngagement: {
        type: Number,
        default: 0,
      },
      qualityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      newContentBonus: {
        type: Number,
        default: 0,
      },
      month: {
        type: Number,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
    },

    // Content Performance Metrics
    contentMetrics: {
      totalCourses: {
        type: Number,
        default: 0,
      },
      totalTutorials: {
        type: Number,
        default: 0,
      },
      totalStudents: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
      retentionRate: {
        type: Number,
        default: 0,
      },
    },

    // Revenue Breakdown
    revenueBreakdown: {
      fromSubscriptions: {
        type: Number,
        default: 0,
      },
      fromDirectSales: {
        type: Number,
        default: 0,
      },
      fromLiveSessions: {
        type: Number,
        default: 0,
      },
      bonuses: {
        type: Number,
        default: 0,
      },
    },

    // Payout Information
    payout: {
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
      },
      amount: {
        type: Number,
        default: 0,
      },
      stripeTransferId: String,
      payoutDate: Date,
      failureReason: String,
    },

    // Performance Bonuses
    bonuses: [
      {
        type: {
          type: String,
          enum: [
            "quality",
            "engagement",
            "new_content",
            "student_retention",
            "top_performer",
          ],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Revenue History
    history: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: Number,
        source: {
          type: String,
          enum: ["subscription", "direct_sale", "live_session", "bonus"],
        },
        contentId: mongoose.Schema.Types.ObjectId,
        contentType: {
          type: String,
          enum: ["course", "tutorial", "live_session"],
        },
        studentId: mongoose.Schema.Types.ObjectId,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for performance
instructorRevenueSchema.index(
  { instructorId: 1, month: 1, year: 1 },
  { unique: true }
);
instructorRevenueSchema.index({ "payout.status": 1, "payout.payoutDate": 1 });
instructorRevenueSchema.index({ subscriptionTier: 1 });

// Virtual for total monthly earnings
instructorRevenueSchema.virtual("totalEarnings").get(function () {
  return (
    this.revenueBreakdown.fromSubscriptions +
    this.revenueBreakdown.fromDirectSales +
    this.revenueBreakdown.fromLiveSessions +
    this.revenueBreakdown.bonuses
  );
});

// Virtual for performance score
instructorRevenueSchema.virtual("performanceScore").get(function () {
  const weights = {
    engagement: 0.4,
    retention: 0.3,
    quality: 0.2,
    newContent: 0.1,
  };

  return (
    ((this.monthlyRevenue.totalEngagement / 100) * weights.engagement +
      (this.contentMetrics.retentionRate / 100) * weights.retention +
      (this.monthlyRevenue.qualityScore / 100) * weights.quality +
      (this.monthlyRevenue.newContentBonus > 0 ? 1 : 0) * weights.newContent) *
    100
  );
});

// Methods
instructorRevenueSchema.methods.calculateMonthlyShare = function (
  totalSubscriptionRevenue
) {
  const performanceMultipliers = {
    engagement: this.monthlyRevenue.totalEngagement / 1000, // Normalize engagement
    retention: this.contentMetrics.retentionRate / 100,
    quality: this.monthlyRevenue.qualityScore / 100,
    newContent: this.monthlyRevenue.newContentBonus > 0 ? 1.1 : 1.0,
  };

  // Base share from instructor's content performance
  const baseShare = totalSubscriptionRevenue * 0.6; // 60% goes to content pool

  // Calculate instructor's portion based on performance
  const totalPerformanceScore = this.performanceScore / 100;
  const instructorShare = baseShare * totalPerformanceScore;

  // Apply revenue share percentage
  const finalShare = instructorShare * (this.revenueSharePercentage / 100);

  return Math.round(finalShare * 100) / 100; // Round to 2 decimal places
};

instructorRevenueSchema.methods.addRevenue = function (
  amount,
  source,
  contentId,
  contentType,
  studentId,
  metadata = {}
) {
  // Add to revenue breakdown
  switch (source) {
    case "subscription":
      this.revenueBreakdown.fromSubscriptions += amount;
      break;
    case "direct_sale":
      this.revenueBreakdown.fromDirectSales += amount;
      break;
    case "live_session":
      this.revenueBreakdown.fromLiveSessions += amount;
      break;
    case "bonus":
      this.revenueBreakdown.bonuses += amount;
      break;
  }

  // Add to history
  this.history.push({
    amount,
    source,
    contentId,
    contentType,
    studentId,
    metadata,
  });

  // Update total earned
  this.monthlyRevenue.totalEarned += amount;

  return this.save();
};

instructorRevenueSchema.methods.addBonus = function (
  type,
  amount,
  description
) {
  this.bonuses.push({
    type,
    amount,
    description,
  });

  this.revenueBreakdown.bonuses += amount;
  this.monthlyRevenue.totalEarned += amount;

  return this.save();
};

instructorRevenueSchema.methods.processPayout = function (stripeTransferId) {
  this.payout.status = "processing";
  this.payout.amount = this.totalEarnings;
  this.payout.stripeTransferId = stripeTransferId;
  this.payout.payoutDate = new Date();

  return this.save();
};

instructorRevenueSchema.methods.completePayout = function () {
  this.payout.status = "completed";
  return this.save();
};

instructorRevenueSchema.methods.failPayout = function (reason) {
  this.payout.status = "failed";
  this.payout.failureReason = reason;
  return this.save();
};

// Statics
instructorRevenueSchema.statics.getMonthlyRevenue = function (
  instructorId,
  month,
  year
) {
  return this.findOne({ instructorId, month, year });
};

instructorRevenueSchema.statics.createMonthlyRecord = function (
  instructorId,
  month,
  year,
  subscriptionTier = "basic"
) {
  return this.create({
    instructorId,
    month,
    year,
    subscriptionTier,
  });
};

instructorRevenueSchema.statics.getTopPerformers = function (
  month,
  year,
  limit = 10
) {
  return this.find({ month, year })
    .populate("instructorId", "name email")
    .sort({ "monthlyRevenue.totalEarned": -1 })
    .limit(limit);
};

instructorRevenueSchema.statics.calculateTotalPayouts = function (month, year) {
  return this.aggregate([
    { $match: { month, year } },
    {
      $group: {
        _id: null,
        totalPayouts: { $sum: "$monthlyRevenue.totalEarned" },
        totalInstructors: { $sum: 1 },
        averagePayout: { $avg: "$monthlyRevenue.totalEarned" },
      },
    },
  ]);
};

// Pre-save middleware
instructorRevenueSchema.pre("save", function (next) {
  // Update revenue share percentage based on subscription tier
  if (this.isModified("subscriptionTier")) {
    const rates = {
      basic: 70,
      pro: 80,
      premium: 85,
    };
    this.revenueSharePercentage = rates[this.subscriptionTier] || 70;
  }

  next();
});

module.exports = mongoose.model("InstructorRevenue", instructorRevenueSchema);
