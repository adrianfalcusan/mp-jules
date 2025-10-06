// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
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
    thumbnail: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    videoLinks: [
      {
        type: String,
        trim: true,
      },
    ],
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    formattedDuration: {
      type: String,
      default: "Duration TBD",
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
    // Engagement metrics
    enrollmentCount: {
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
    // Content structure
    lessons: [
      {
        title: String,
        description: String,
        videoUrl: String,
        videoKey: String, // For S3/Bunny CDN
        videoProvider: {
          type: String,
          enum: ["aws", "bunnycdn", "local"],
          default: "local",
        },
        duration: Number, // in minutes
        order: {
          type: Number,
          default: 0,
        },
        isPublished: {
          type: Boolean,
          default: false,
        },
        // Materials for each lesson
        materials: {
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
          // PDF documents
          pdfs: [
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
                  "sheet-music",
                  "chord-chart",
                  "lyrics",
                  "notes",
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
          // Additional resources
          resources: [
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
                enum: ["audio", "image", "document", "link", "other"],
                default: "other",
              },
              description: String,
              order: {
                type: Number,
                default: 0,
              },
            },
          ],
        },
      },
    ],
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
    // Bunny CDN video fields
    bunnyVideoUrl: {
      type: String,
      default: "",
    },
    bunnyVideoQualities: [
      {
        type: String, // e.g., "720p", "1080p"
      },
    ],
    bunnyThumbnailUrl: {
      type: String,
      default: "",
    },
    videoKey: {
      type: String,
      default: "",
    },
    videoProcessed: {
      type: Boolean,
      default: false,
    },
    videoProvider: {
      type: String,
      enum: ["aws", "bunnycdn", "local"],
      default: "local",
    },
    videoDuration: {
      type: Number, // in seconds
      default: 0,
    },

    // Legacy fields (keep for backward compatibility)
    isPublished: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
courseSchema.index({ teacher: 1, status: 1 });
courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ title: "text", description: "text" });

// Virtual for enrollment count from Enrollment collection
courseSchema.virtual("enrollments", {
  ref: "Enrollment",
  localField: "_id",
  foreignField: "itemId",
  match: { itemType: "course" },
  count: true,
});

// Update enrollmentCount when queried
courseSchema.pre(/^find/, function () {
  this.populate({
    path: "enrollments",
    match: { itemType: "course" },
  });
});

// Auto-update enrollmentCount
courseSchema.methods.updateEnrollmentCount = async function () {
  const Enrollment = mongoose.model("Enrollment");
  const count = await Enrollment.countDocuments({
    itemId: this._id,
    itemType: "course",
  });
  this.enrollmentCount = count;
  await this.save();
  return count;
};

// Auto-update average rating
courseSchema.methods.updateAverageRating = async function () {
  const Review = mongoose.model("Review");
  const reviews = await Review.find({ course: this._id });

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

module.exports = mongoose.model("Course", courseSchema);
