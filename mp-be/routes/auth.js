// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Joi = require("joi");
const validate = require("../middlewares/validate");
const { sendMail } = require("../utils/mailer");

// Joi schemas
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("student", "teacher", "admin").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

const forgotSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const verifySchema = Joi.object({ token: Joi.string().required() });

// POST /api/auth/signup
router.post("/signup", validate(signupSchema), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    user = new User({ name, email, password, role, emailVerificationToken });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Send verification email (dev logs if no SMTP)
    const verifyUrl = `${
      process.env.BACKEND_URL ||
      "http://localhost:" + (process.env.PORT || 8080)
    }/api/auth/verify-email?token=${emailVerificationToken}`;
    await sendMail({
      to: user.email,
      subject: "Verify your email",
      text: `Click to verify your email: ${verifyUrl}`,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", validate(forgotSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true }); // don't reveal existence

    user.resetPasswordToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); // 30m
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${user.resetPasswordToken}`;
    await sendMail({
      to: user.email,
      subject: "Reset your password",
      text: `Click to reset your password: ${resetUrl}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", validate(resetSchema), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the current token (even if expired)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // If token is expired, we can still decode it to get user info
      if (err.name === "TokenExpiredError") {
        decoded = jwt.decode(token);
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // Get fresh user data
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/auth/resend-verification
router.post(
  "/resend-verification",
  validate(forgotSchema),
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.json({ success: true });
      if (user.isEmailVerified) return res.json({ success: true });

      user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
      await user.save();

      const verifyUrl = `${
        process.env.BACKEND_URL ||
        "http://localhost:" + (process.env.PORT || 8080)
      }/api/auth/verify-email?token=${user.emailVerificationToken}`;
      await sendMail({
        to: user.email,
        subject: "Verify your email",
        text: verifyUrl,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Resend verification error:", err);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

// POST /api/auth/verify-email
router.post("/verify-email", validate(verifySchema), async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid token" });

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// NEW: GET /api/auth/verify-email?token=... (one-click verification with redirect)
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) return res.status(400).send("Invalid or expired token");

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationToken = undefined;
    await user.save();

    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    // Redirect user to frontend with a success flag
    return res.redirect(`${frontend}/login?verified=1`);
  } catch (err) {
    console.error("Verify email (GET) error:", err);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
