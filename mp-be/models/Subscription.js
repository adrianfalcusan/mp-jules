// models/Subscription.js
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Subscription Details
    tier: {
      type: String,
      enum: ["free", "basic", "pro", "premium"],
      default: "free",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired", "paused"],
      default: "active",
      required: true,
    },

    // Stripe Integration
    stripeCustomerId: {
      type: String,
      index: true,
    },

    stripeSubscriptionId: {
      type: String,
      index: true,
    },

    stripePriceId: {
      type: String,
    },

    // Billing Information
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },

    currentPeriodEnd: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      },
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    amount: {
      type: Number,
      default: 0, // Amount in cents
    },

    currency: {
      type: String,
      default: "usd",
    },

    // Usage Tracking
    usage: {
      tutorialViews: {
        type: Number,
        default: 0,
      },
      courseEnrollments: {
        type: Number,
        default: 0,
      },
      liveSessionsUsed: {
        type: Number,
        default: 0,
      },
      downloadedContent: {
        type: Number,
        default: 0, // Size in MB
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },

    // Tier Limits
    limits: {
      tutorialViews: {
        type: Number,
        default: function () {
          const limits = {
            free: 3,
            basic: -1, // Unlimited
            pro: -1,
            premium: -1,
          };
          return limits[this.tier] || 3;
        },
      },
      courseEnrollments: {
        type: Number,
        default: function () {
          const limits = {
            free: 0,
            basic: 5,
            pro: -1, // Unlimited
            premium: -1,
          };
          return limits[this.tier] || 0;
        },
      },
      liveSessionCredits: {
        type: Number,
        default: function () {
          const limits = {
            free: 0,
            basic: 0,
            pro: 2,
            premium: 4,
          };
          return limits[this.tier] || 0;
        },
      },
      downloadStorage: {
        type: Number, // MB
        default: function () {
          const limits = {
            free: 0,
            basic: 0,
            pro: 1000, // 1GB
            premium: -1, // Unlimited
          };
          return limits[this.tier] || 0;
        },
      },
      videoQuality: {
        type: [String],
        default: function () {
          const qualities = {
            free: ["480p"],
            basic: ["480p", "720p"],
            pro: ["480p", "720p", "1080p"],
            premium: ["480p", "720p", "1080p", "4k"],
          };
          return qualities[this.tier] || ["480p"];
        },
      },
    },

    // Subscription History
    history: [
      {
        action: {
          type: String,
          enum: [
            "created",
            "upgraded",
            "downgraded",
            "cancelled",
            "renewed",
            "paused",
            "resumed",
          ],
          required: true,
        },
        previousTier: String,
        newTier: String,
        amount: Number,
        date: {
          type: Date,
          default: Date.now,
        },
        reason: String,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],

    // Payment History
    payments: [
      {
        stripePaymentIntentId: String,
        amount: Number,
        currency: String,
        status: {
          type: String,
          enum: ["succeeded", "failed", "pending", "cancelled"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],

    // Cancellation Information
    cancellation: {
      cancelledAt: Date,
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
      reason: String,
      feedback: String,
    },

    // Trial Information
    trial: {
      isTrialActive: {
        type: Boolean,
        default: false,
      },
      trialStart: Date,
      trialEnd: Date,
      trialTier: {
        type: String,
        enum: ["basic", "pro", "premium"],
      },
    },

    // Metadata
    metadata: {
      source: String, // How they subscribed
      campaign: String, // Marketing campaign
      referralCode: String,
      notes: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ tier: 1, status: 1 });

// Virtual for days remaining
subscriptionSchema.virtual("daysRemaining").get(function () {
  if (!this.currentPeriodEnd) return 0;
  const now = new Date();
  const diffTime = this.currentPeriodEnd - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for usage percentage
subscriptionSchema.virtual("usagePercentage").get(function () {
  const usage = {};

  if (this.limits.tutorialViews > 0) {
    usage.tutorialViews =
      (this.usage.tutorialViews / this.limits.tutorialViews) * 100;
  }

  if (this.limits.courseEnrollments > 0) {
    usage.courseEnrollments =
      (this.usage.courseEnrollments / this.limits.courseEnrollments) * 100;
  }

  if (this.limits.liveSessionCredits > 0) {
    usage.liveSessionCredits =
      (this.usage.liveSessionsUsed / this.limits.liveSessionCredits) * 100;
  }

  return usage;
});

// Methods
subscriptionSchema.methods.canAccessContent = function (
  contentType,
  quality = "480p"
) {
  if (this.status !== "active" && !this.trial.isTrialActive) {
    return { allowed: false, reason: "Subscription not active" };
  }

  // Check if trial expired
  if (this.trial.isTrialActive && new Date() > this.trial.trialEnd) {
    return { allowed: false, reason: "Trial expired" };
  }

  // Check video quality access
  if (!this.limits.videoQuality.includes(quality)) {
    return {
      allowed: false,
      reason: `Quality ${quality} not available for ${this.tier} tier`,
      availableQualities: this.limits.videoQuality,
    };
  }

  // Check specific content type limits
  switch (contentType) {
    case "tutorial":
      if (
        this.limits.tutorialViews > 0 &&
        this.usage.tutorialViews >= this.limits.tutorialViews
      ) {
        return { allowed: false, reason: "Tutorial view limit reached" };
      }
      break;

    case "course":
      if (
        this.limits.courseEnrollments > 0 &&
        this.usage.courseEnrollments >= this.limits.courseEnrollments
      ) {
        return { allowed: false, reason: "Course enrollment limit reached" };
      }
      break;

    case "live_session":
      if (
        this.limits.liveSessionCredits > 0 &&
        this.usage.liveSessionsUsed >= this.limits.liveSessionCredits
      ) {
        return { allowed: false, reason: "Live session credits exhausted" };
      }
      break;
  }

  return { allowed: true };
};

subscriptionSchema.methods.incrementUsage = function (type, amount = 1) {
  switch (type) {
    case "tutorial":
      this.usage.tutorialViews += amount;
      break;
    case "course":
      this.usage.courseEnrollments += amount;
      break;
    case "live_session":
      this.usage.liveSessionsUsed += amount;
      break;
    case "download":
      this.usage.downloadedContent += amount;
      break;
  }
  return this.save();
};

subscriptionSchema.methods.resetUsage = function () {
  this.usage.tutorialViews = 0;
  this.usage.courseEnrollments = 0;
  this.usage.liveSessionsUsed = 0;
  this.usage.downloadedContent = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

subscriptionSchema.methods.upgradeTo = function (newTier, stripeData = {}) {
  const previousTier = this.tier;
  this.tier = newTier;

  // Update limits based on new tier
  this.limits = {
    tutorialViews:
      this.schema.paths.limits.schema.paths.tutorialViews.default.call({
        tier: newTier,
      }),
    courseEnrollments:
      this.schema.paths.limits.schema.paths.courseEnrollments.default.call({
        tier: newTier,
      }),
    liveSessionCredits:
      this.schema.paths.limits.schema.paths.liveSessionCredits.default.call({
        tier: newTier,
      }),
    downloadStorage:
      this.schema.paths.limits.schema.paths.downloadStorage.default.call({
        tier: newTier,
      }),
    videoQuality:
      this.schema.paths.limits.schema.paths.videoQuality.default.call({
        tier: newTier,
      }),
  };

  // Add to history
  this.history.push({
    action: "upgraded",
    previousTier,
    newTier,
    amount: stripeData.amount,
    metadata: stripeData,
  });

  return this.save();
};

subscriptionSchema.methods.cancel = function (
  reason = "",
  cancelAtPeriodEnd = true
) {
  this.cancellation = {
    cancelledAt: new Date(),
    cancelAtPeriodEnd,
    reason,
    feedback: reason,
  };

  if (!cancelAtPeriodEnd) {
    this.status = "cancelled";
  }

  this.history.push({
    action: "cancelled",
    reason,
    metadata: { cancelAtPeriodEnd },
  });

  return this.save();
};

// Statics
subscriptionSchema.statics.getTierPricing = function () {
  return {
    basic: {
      monthly: { amount: 999, currency: "usd" }, // $9.99
      yearly: { amount: 9999, currency: "usd" }, // $99.99 (2 months free)
    },
    pro: {
      monthly: { amount: 1999, currency: "usd" }, // $19.99
      yearly: { amount: 19999, currency: "usd" }, // $199.99 (2 months free)
    },
    premium: {
      monthly: { amount: 3999, currency: "usd" }, // $39.99
      yearly: { amount: 39999, currency: "usd" }, // $399.99 (2 months free)
    },
  };
};

subscriptionSchema.statics.findActiveSubscription = function (userId) {
  return this.findOne({
    userId,
    status: "active",
    $or: [
      { currentPeriodEnd: { $gt: new Date() } },
      { trial: { isTrialActive: true, trialEnd: { $gt: new Date() } } },
    ],
  });
};

// Pre-save middleware
subscriptionSchema.pre("save", function (next) {
  // Auto-expire subscriptions
  if (
    this.currentPeriodEnd &&
    new Date() > this.currentPeriodEnd &&
    this.status === "active"
  ) {
    this.status = "expired";
  }

  // Auto-expire trials
  if (
    this.trial.isTrialActive &&
    this.trial.trialEnd &&
    new Date() > this.trial.trialEnd
  ) {
    this.trial.isTrialActive = false;
  }

  next();
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
