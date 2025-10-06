// routes/testimonials.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const Testimonial = require("../models/Testimonial");

// GET /api/testimonials - Publicly list testimonials
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/testimonials - Create a testimonial (Admin only)
router.post("/", auth, role(["admin"]), async (req, res) => {
  try {
    const { quote, signature } = req.body;
    if (!quote || !signature) {
      return res.status(400).json({
        success: false,
        message: "Quote and signature are required",
      });
    }
    const testimonial = new Testimonial({ quote, signature });
    await testimonial.save();
    res.json({ success: true, testimonial });
  } catch (err) {
    console.error("Error creating testimonial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/testimonials/:id - Update a testimonial (Admin only)
router.put("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const { quote, signature } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }
    testimonial.quote = quote || testimonial.quote;
    testimonial.signature = signature || testimonial.signature;
    await testimonial.save();
    res.json({ success: true, testimonial });
  } catch (err) {
    console.error("Error updating testimonial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/testimonials/:id - Delete a testimonial (Admin only)
router.delete("/:id", auth, role(["admin"]), async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });
    }
    await testimonial.remove();
    res.json({ success: true, message: "Testimonial deleted" });
  } catch (err) {
    console.error("Error deleting testimonial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
