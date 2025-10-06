const mongoose = require("mongoose");

const tutorialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stripeProductId: {
      type: String,
      default: "",
      index: true,
    },
    stripePriceId: {
      type: String,
      default: "",
      index: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    category: {
      type: String,
      default: "Music",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    mainVideoUrl: {
      type: String,
      default: "",
    },
    videoKey: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    formattedDuration: {
      type: String,
      default: "Duration TBD",
    },
    // Bunny CDN Integration (93% cheaper than AWS!)
    bunnyVideoUrl: {
      type: String,
      default: "",
    },
    bunnyVideoQualities: {
      type: Object, // Stores different quality URLs
      default: {},
    },
    bunnyThumbnailUrl: {
      type: String,
      default: "",
    },
    videoProcessed: {
      type: Boolean,
      default: false,
    },
    videoProvider: {
      type: String,
      enum: ["aws", "bunny"],
      default: "aws", // For backward compatibility
    },
    // Content approval system
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    // Multitrack audio files
    multitracks: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: [
            "drums",
            "bass",
            "guitar",
            "vocals",
            "piano",
            "synth",
            "other",
          ],
          default: "other",
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    // Engagement metrics
    purchaseCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    // Additional metadata
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    // Difficulty and technical info
    instruments: [
      {
        type: String,
        trim: true,
      },
    ],
    genres: [
      {
        type: String,
        trim: true,
      },
    ],
    // Legacy fields (keep for backward compatibility)
    isPublished: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    audioTracks: [
      {
        name: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
tutorialSchema.index({ teacher: 1, status: 1 });
tutorialSchema.index({ status: 1, createdAt: -1 });
tutorialSchema.index({ title: "text", description: "text" });
tutorialSchema.index({ category: 1, level: 1 });
tutorialSchema.index({ averageRating: -1 });

// Virtual for purchase count from Enrollment collection
tutorialSchema.virtual("purchases", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "itemId",
  match: { itemType: "tutorial" },
  count: true,
});

// Update purchaseCount when queried
tutorialSchema.pre(/^find/, function () {
  this.populate({
    path: "purchases",
    match: { itemType: "tutorial" },
  });
});

// Auto-update purchase count
tutorialSchema.methods.updatePurchaseCount = async function () {
  const Enrollment = mongoose.model("Enrollment");
  const count = await Enrollment.countDocuments({
    itemId: this._id,
    itemType: "tutorial",
  });
  this.purchaseCount = count;
  await this.save();
  return count;
};

// Auto-update average rating
tutorialSchema.methods.updateAverageRating = async function () {
  const Review = mongoose.model("Review");
  const reviews = await Review.find({ tutorial: this._id });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / reviews.length;
    this.totalRatings = reviews.length;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }

  await this.save();
  return this.averageRating;
};

// Method to get all tracks for multitrack player
tutorialSchema.methods.getTracksForPlayer = function () {
  return this.multitracks
    .map((track) => ({
      name: track.name,
      url: track.url,
      type: track.type,
    }))
    .sort((a, b) => a.order - b.order);
};

module.exports = mongoose.model("Tutorial", tutorialSchema);
