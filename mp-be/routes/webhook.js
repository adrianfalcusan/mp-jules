// routes/webhook.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Course = require("../models/Course");
const Tutorial = require("../models/Tutorial");
const { sendMail } = require("../utils/mailer");
const WebhookEvent = require("../models/WebhookEvent");

const verifyWebhook = (req) => {
  const dev = process.env.NODE_ENV === "development";
  if (dev && !process.env.STRIPE_WEBHOOK_SECRET) {
    // In development without secret, trust the payload for local testing only
    return { event: JSON.parse(req.body.toString()) };
  }
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers["stripe-signature"],
    process.env.STRIPE_WEBHOOK_SECRET
  );
  return { event };
};

// raw body for stripe
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      const result = verifyWebhook(req);
      event = result.event;
    } catch (err) {
      console.error("Stripe signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Persist event for idempotency (ignore duplicates)
      const object = event.data?.object || {};
      const metadata = object.metadata || {};
      const record = await WebhookEvent.findOneAndUpdate(
        { eventId: event.id },
        {
          $setOnInsert: {
            eventId: event.id,
            type: event.type,
            sessionId: object.id,
            paymentIntentId: object.payment_intent,
            customerId: object.customer,
            metadata,
            payload: event,
            receivedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // If already processed, short-circuit
      if (record.processedAt) {
        return res.json({ received: true, duplicate: true });
      }

      if (event.type === "checkout.session.completed") {
        const s = object;
        const { itemId, itemType, userId } = s.metadata || {};
        if (!itemId || !itemType || !userId) {
          console.error("Missing metadata in session");
        } else {
          const exists = await Enrollment.findOne({
            student: userId,
            itemId,
            itemType,
          });
          if (!exists) {
            await Enrollment.create({ student: userId, itemId, itemType });
            console.log(
              `Enrollment created for ${userId} → ${itemType} ${itemId}`
            );
          }

          // Receipt email (best effort)
          try {
            const user = await User.findById(userId).select("email name");
            const Model = itemType === "course" ? Course : Tutorial;
            const item = await Model.findById(itemId).select("title price");
            if (user && item) {
              await sendMail({
                to: user.email,
                subject: "Your purchase receipt",
                text: `Hi ${user.name || ""},\n\nThanks for your purchase: ${
                  item.title
                }.\nAmount: $${(item.price || 0).toFixed(2)}\nSession: ${
                  s.id || "dev"
                }\n\nEnjoy learning!`,
              });
            }
          } catch (e) {
            console.warn("Receipt email failed:", e.message);
          }
        }
      }

      // Refunds/chargebacks → revoke access
      if (
        event.type === "charge.refunded" ||
        event.type === "charge.dispute.created"
      ) {
        // We try to find the purchase via stored metadata/session
        // This is best-effort without full object relations
        const { metadata } = record;
        const { itemId, itemType, userId } = metadata || {};
        if (itemId && itemType && userId) {
          try {
            const deleted = await Enrollment.findOneAndDelete({
              student: userId,
              itemId,
              itemType,
            });
            if (deleted) {
              const user = await User.findById(userId).select("email name");
              const Model = itemType === "course" ? Course : Tutorial;
              const item = await Model.findById(itemId).select("title");
              if (user && item) {
                await sendMail({
                  to: user.email,
                  subject: "Access revoked due to refund",
                  text: `Hi ${user.name || ""},\n\nYour access to '${
                    item.title
                  }' has been revoked due to a refund/chargeback. If this is unexpected, please contact support.`,
                });
              }
            }
          } catch (e) {
            console.error("Revoke access failed:", e.message);
          }
        } else {
          console.warn("Refund/dispute event without enrollment metadata.");
        }
      }

      // mark processed
      record.processedAt = new Date();
      await record.save();
    } catch (err) {
      console.error("Webhook processing error:", err);
      // do not 500 to stripe, acknowledge receipt
    }

    res.json({ received: true });
  }
);

module.exports = router;
