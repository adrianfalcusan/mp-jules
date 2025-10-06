// tests/setup.js
const mongoose = require("mongoose");

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock external services in test environment
jest.mock("../utils/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

jest.mock("stripe", () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: "https://checkout.stripe.com/test-session",
          id: "test-session-id",
        }),
      },
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "test-session-id",
            metadata: {
              itemId: "test-item-id",
              itemType: "course",
              userId: "test-user-id",
            },
          },
        },
      }),
    },
  }));
});

// Global test cleanup
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
