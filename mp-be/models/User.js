// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  popularity: { type: Number, default: 0 },
  // Subscription tier for Bunny CDN cost protection
  subscriptionTier: {
    type: String,
    enum: ["free", "basic", "pro", "premium"],
    default: "free",
  },
  // Auth helpers
  resetPasswordToken: { type: String, index: true },
  resetPasswordExpires: { type: Date },
  emailVerificationToken: { type: String, index: true },
  emailVerifiedAt: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
