// tests/auth.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); // You'll need to export app from index.js
const User = require("../models/User");

// Test database setup
const MONGODB_URI =
  process.env.TEST_DB_URI || "mongodb://localhost:27017/musicloud-test";

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Authentication Endpoints", () => {
  describe("POST /api/auth/signup", () => {
    test("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "student",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isEmailVerified: false,
      });
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    test("should reject duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      // Create first user
      await request(app).post("/api/auth/signup").send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Email already exists");
    });

    test("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "John Doe",
          // Missing email and password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });

    test("should validate email format", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "John Doe",
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test("should validate password length", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "John Doe",
          email: "john@example.com",
          password: "123", // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      const response = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
      testUser = response.body.user;
    });

    test("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe("test@example.com");
      expect(response.body.token).toBeDefined();
    });

    test("should reject invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid email or password");
    });

    test("should reject invalid password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid email or password");
    });
  });

  describe("POST /api/auth/refresh", () => {
    let token;

    beforeEach(async () => {
      const response = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
      token = response.body.token;
    });

    test("should refresh valid token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    test("should reject request without token", async () => {
      const response = await request(app).post("/api/auth/refresh").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No token provided");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });

    test("should process forgot password request", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({
          email: "test@example.com",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test("should not reveal if email exists", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({
          email: "nonexistent@example.com",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

describe("Protected Routes", () => {
  let token;
  let userId;

  beforeEach(async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    token = response.body.token;
    userId = response.body.user.id;
  });

  test("should access protected route with valid token", async () => {
    const response = await request(app)
      .get("/api/protected")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test("should reject protected route without token", async () => {
    const response = await request(app).get("/api/protected").expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("No token");
  });

  test("should reject protected route with invalid token", async () => {
    const response = await request(app)
      .get("/api/protected")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Token is not valid");
  });
});

describe("Rate Limiting", () => {
  test("should enforce rate limiting on auth endpoints", async () => {
    const requests = [];

    // Make 11 requests (limit is 10)
    for (let i = 0; i < 11; i++) {
      requests.push(
        request(app).post("/api/auth/login").send({
          email: "test@example.com",
          password: "password123",
        })
      );
    }

    const responses = await Promise.all(requests);

    // Last request should be rate limited
    const lastResponse = responses[responses.length - 1];
    expect(lastResponse.status).toBe(429);
  });
});
