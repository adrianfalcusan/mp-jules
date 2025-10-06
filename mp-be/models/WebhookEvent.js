// models/WebhookEvent.js
const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, index: true, unique: true, sparse: true },
    type: { type: String, index: true },
    processedAt: { type: Date },
    receivedAt: { type: Date, default: Date.now },
    // Helpful linkage for refunds/disputes
    sessionId: { type: String, index: true },
    paymentIntentId: { type: String, index: true },
    customerId: { type: String, index: true },
    metadata: {
      itemId: String,
      itemType: String,
      userId: String,
    },
    payload: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookEvent", webhookEventSchema);
