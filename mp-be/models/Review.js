// models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // Support both courses and tutorials
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: function () {
      return !this.tutorial;
    },
  },
  tutorial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutorial",
    required: function () {
      return !this.course;
    },
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Compound indexes to ensure one student can't spam the same item multiple times
reviewSchema.index({ course: 1, student: 1 }, { unique: true, sparse: true });
reviewSchema.index({ tutorial: 1, student: 1 }, { unique: true, sparse: true });

// Post-save middleware to update average ratings
reviewSchema.post("save", async function () {
  if (this.course) {
    const Course = mongoose.model("Course");
    const course = await Course.findById(this.course);
    if (course) {
      await course.updateAverageRating();
    }
  }

  if (this.tutorial) {
    const Tutorial = mongoose.model("Tutorial");
    const tutorial = await Tutorial.findById(this.tutorial);
    if (tutorial) {
      await tutorial.updateAverageRating();
    }
  }
});

// Post-remove middleware to update average ratings when review is deleted
reviewSchema.post("remove", async function () {
  if (this.course) {
    const Course = mongoose.model("Course");
    const course = await Course.findById(this.course);
    if (course) {
      await course.updateAverageRating();
    }
  }

  if (this.tutorial) {
    const Tutorial = mongoose.model("Tutorial");
    const tutorial = await Tutorial.findById(this.tutorial);
    if (tutorial) {
      await tutorial.updateAverageRating();
    }
  }
});

module.exports = mongoose.model("Review", reviewSchema);
