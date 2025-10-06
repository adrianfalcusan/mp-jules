// routes/payments.js  – unified for courses & tutorials
const express = require("express");
const router = express.Router();
// Initialize Stripe only if configured
let stripe = null;
if (
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY !== "CHANGE_ME_your_stripe_secret_key"
) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
} else {
  console.log("⚠️  Stripe not configured - payment functionality disabled");
}
const auth = require("../middlewares/auth");

const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");
const Enrollment = require("../models/Enrollment");

/**
 * POST /api/payments/create-session
 * Body: { itemId, itemType }   where itemType = "course" | "tutorial"
 */
router.post("/create-session", auth, async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message:
          "Payment system is currently unavailable. Please try again later.",
      });
    }

    const { itemId, itemType } = req.body;
    if (!itemId || !["course", "tutorial"].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: "Missing itemId or invalid itemType",
      });
    }

    // pick the correct model
    const Model = itemType === "course" ? Course : Tutorial;
    const item = await Model.findById(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // already purchased?
    const exists = await Enrollment.findOne({
      student: req.user.id,
      itemId,
      itemType,
    });
    if (exists) {
      return res.json({ success: false, message: "Already enrolled." });
    }

    // Stripe Session
    const priceCents = Math.round(item.price * 100);

    /* keep frontend path SINGULAR for "tutorial", plural for "courses" */
    const frontPath = itemType === "course" ? "courses" : "tutorial";

    // Prefer mapped Stripe Price if available
    let lineItems;
    if (item.stripePriceId) {
      lineItems = [
        {
          price: item.stripePriceId,
          quantity: 1,
        },
      ];
    } else {
      // Fallback – inline price data (recommended to map via admin tool)
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.title,
              description: item.description,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/${frontPath}/${itemId}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/${frontPath}/${itemId}?canceled=true`,
      metadata: { itemId, itemType, userId: req.user.id },
    });

    return res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("Create‑session error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
