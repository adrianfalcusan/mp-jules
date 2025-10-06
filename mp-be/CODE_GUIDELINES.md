# Backend Code Guidelines

## Table of Contents

1. [General Principles](#general-principles)
2. [Project Structure](#project-structure)
3. [Express.js Best Practices](#expressjs-best-practices)
4. [Database Guidelines](#database-guidelines)
5. [API Design Guidelines](#api-design-guidelines)
6. [Security Guidelines](#security-guidelines)
7. [Error Handling](#error-handling)
8. [Validation Guidelines](#validation-guidelines)
9. [Testing Guidelines](#testing-guidelines)
10. [Performance Guidelines](#performance-guidelines)
11. [Code Quality](#code-quality)
12. [File Naming Conventions](#file-naming-conventions)

## General Principles

### 1. Code Organization

- Follow the **Single Responsibility Principle** - each module should have one clear purpose
- Keep functions small and focused (ideally under 20 lines)
- Use meaningful names for variables, functions, and modules
- Write self-documenting code with clear intent

### 2. Consistency

- Use consistent formatting and indentation
- Follow established patterns in the codebase
- Use the same naming conventions throughout the project
- Maintain consistent error handling patterns

### 3. Maintainability

- Write code that is easy to understand and modify
- Avoid magic numbers and hardcoded values
- Use environment variables for configuration
- Document complex logic with comments

## Project Structure

```
music-platform-backend/
├── index.js              # Application entry point
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (not in git)
├── .gitignore           # Git ignore rules
├── middlewares/         # Custom middleware functions
│   ├── auth.js          # Authentication middleware
│   ├── role.js          # Role-based access control
│   ├── uploadVideo.js   # File upload middleware
│   └── validate.js      # Request validation middleware
├── models/              # MongoDB/Mongoose models
│   ├── Course.js        # Course model
│   ├── Enrollment.js    # Enrollment model
│   ├── Review.js        # Review model
│   ├── Testimonial.js   # Testimonial model
│   ├── Tutorial.js      # Tutorial model
│   └── User.js          # User model
├── routes/              # API route handlers
│   ├── admin.js         # Admin routes
│   ├── auth.js          # Authentication routes
│   ├── courses.js       # Course routes
│   ├── payments.js      # Payment routes
│   ├── protected.js     # Protected routes
│   ├── reviews.js       # Review routes
│   ├── teachers.js      # Teacher routes
│   ├── testimonials.js  # Testimonial routes
│   ├── tutorials.js     # Tutorial routes
│   └── webhook.js       # Webhook routes
├── utils/               # Utility functions
│   └── s3.js            # AWS S3 utilities
├── uploads/             # File uploads (development only)
└── tests/               # Test files
    ├── unit/            # Unit tests
    ├── integration/     # Integration tests
    └── fixtures/        # Test data
```

## Express.js Best Practices

### 1. Application Structure

```javascript
// index.js - Main application file
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Environment validation
const requiredEnvVars = ["JWT_SECRET", "DB_URI", "STRIPE_WEBHOOK_SECRET"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`FATAL ERROR: ${varName} is not defined.`);
    process.exit(1);
  }
});

// Security middleware (order matters!)
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/tutorials", require("./routes/tutorials"));
// ... other routes

// Error handling middleware (must be last)
app.use(require("./middlewares/errorHandler"));

// Database connection
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err);
    process.exit(1);
  });
```

### 2. Route Organization

```javascript
// routes/courses.js
const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const validate = require("../middlewares/validate");
const { courseSchema } = require("../schemas/courseSchema");

// GET /api/courses - Get all courses
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(query)
      .populate("teacher", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/courses - Create new course (admin/teacher only)
router.post(
  "/",
  auth,
  role(["admin", "teacher"]),
  validate(courseSchema),
  async (req, res, next) => {
    try {
      const course = new Course({
        ...req.body,
        teacher: req.user.id,
      });

      await course.save();

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
```

### 3. Middleware Best Practices

```javascript
// middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }
    next(error);
  }
};

module.exports = auth;
```

## Database Guidelines

### 1. Mongoose Model Best Practices

```javascript
// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      enum: {
        values: ["piano", "guitar", "drums", "vocals", "theory"],
        message:
          "Category must be one of: piano, guitar, drums, vocals, theory",
      },
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course must have a teacher"],
    },
    thumbnail: {
      type: String,
      required: [true, "Course thumbnail is required"],
    },
    videoUrl: {
      type: String,
      required: [true, "Course video URL is required"],
    },
    duration: {
      type: Number,
      required: [true, "Course duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    level: {
      type: String,
      required: [true, "Course level is required"],
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "Level must be one of: beginner, intermediate, advanced",
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
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
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ teacher: 1 });
courseSchema.index({ isPublished: 1 });

// Virtual for reviews
courseSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "course",
});

// Pre-save middleware
courseSchema.pre("save", function (next) {
  // Ensure price is rounded to 2 decimal places
  if (this.price) {
    this.price = Math.round(this.price * 100) / 100;
  }
  next();
});

// Static method to find published courses
courseSchema.statics.findPublished = function () {
  return this.find({ isPublished: true });
};

// Instance method to calculate average rating
courseSchema.methods.calculateAverageRating = async function () {
  const Review = mongoose.model("Review");
  const stats = await Review.aggregate([
    { $match: { course: this._id } },
    {
      $group: {
        _id: "$course",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.reviewCount = stats[0].reviewCount;
  } else {
    this.averageRating = 0;
    this.reviewCount = 0;
  }

  await this.save();
};

module.exports = mongoose.model("Course", courseSchema);
```

### 2. Database Connection and Error Handling

```javascript
// utils/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

## API Design Guidelines

### 1. RESTful API Design

```javascript
// Standard REST endpoints
// GET    /api/courses          - Get all courses
// GET    /api/courses/:id      - Get specific course
// POST   /api/courses          - Create new course
// PUT    /api/courses/:id      - Update course
// DELETE /api/courses/:id      - Delete course

// Nested resources
// GET    /api/courses/:id/reviews     - Get course reviews
// POST   /api/courses/:id/reviews     - Add review to course
// GET    /api/courses/:id/enrollments - Get course enrollments

// Query parameters for filtering, sorting, pagination
// GET /api/courses?page=1&limit=10&category=piano&sort=price&order=desc
```

### 2. Response Format Standards

```javascript
// Success response format
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}

// Error response format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### 3. HTTP Status Codes

```javascript
// Success codes
200 - OK (GET, PUT, PATCH)
201 - Created (POST)
204 - No Content (DELETE)

// Client error codes
400 - Bad Request (validation errors)
401 - Unauthorized (authentication required)
403 - Forbidden (insufficient permissions)
404 - Not Found (resource doesn't exist)
409 - Conflict (duplicate resource)
422 - Unprocessable Entity (validation errors)

// Server error codes
500 - Internal Server Error
502 - Bad Gateway
503 - Service Unavailable
```

## Security Guidelines

### 1. Input Validation and Sanitization

```javascript
// middlewares/validate.js
const Joi = require("joi");

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errorDetails,
        },
      });
    }

    next();
  };
};

// schemas/courseSchema.js
const Joi = require("joi");

const courseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title cannot exceed 100 characters",
  }),

  description: Joi.string().trim().min(10).max(1000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 1000 characters",
  }),

  price: Joi.number().positive().precision(2).required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be positive",
    "any.required": "Price is required",
  }),

  category: Joi.string()
    .valid("piano", "guitar", "drums", "vocals", "theory")
    .required()
    .messages({
      "any.only":
        "Category must be one of: piano, guitar, drums, vocals, theory",
      "any.required": "Category is required",
    }),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required()
    .messages({
      "any.only": "Level must be one of: beginner, intermediate, advanced",
      "any.required": "Level is required",
    }),

  duration: Joi.number().integer().min(1).required().messages({
    "number.base": "Duration must be a number",
    "number.integer": "Duration must be an integer",
    "number.min": "Duration must be at least 1 minute",
    "any.required": "Duration is required",
  }),
});

module.exports = { courseSchema };
```

### 2. Authentication and Authorization

```javascript
// middlewares/role.js
const role = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Usage examples
router.post("/courses", auth, role(["admin", "teacher"]), createCourse);
router.delete("/courses/:id", auth, role(["admin"]), deleteCourse);
```

### 3. Rate Limiting and Security Headers

```javascript
// Security middleware setup
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

// Apply middleware
app.use(helmet()); // Security headers
app.use(generalLimiter); // General rate limiting
app.use("/api/auth", authLimiter); // Stricter rate limiting for auth
```

## Error Handling

### 1. Centralized Error Handling

```javascript
// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || "Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
```

### 2. Async Error Handling

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage in routes
router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const courses = await Course.find();
    res.json({ success: true, data: courses });
  })
);
```

## Validation Guidelines

### 1. Request Validation

```javascript
// Comprehensive validation example
const userSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Name can only contain letters and spaces",
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 50 characters",
    }),

  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.min": "Password must be at least 8 characters long",
    }),

  role: Joi.string().valid("student", "teacher", "admin").default("student"),

  age: Joi.number().integer().min(13).max(120).optional(),
});
```

### 2. File Upload Validation

```javascript
// middlewares/uploadVideo.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1,
  },
});

module.exports = upload;
```

## Testing Guidelines

### 1. Unit Testing

```javascript
// tests/unit/models/Course.test.js
const mongoose = require("mongoose");
const Course = require("../../../models/Course");

describe("Course Model Test", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Course.deleteMany({});
  });

  it("should create a course with valid data", async () => {
    const validCourse = {
      title: "Piano Basics",
      description: "Learn the fundamentals of piano playing",
      price: 99.99,
      category: "piano",
      level: "beginner",
      duration: 120,
      teacher: new mongoose.Types.ObjectId(),
      thumbnail: "https://example.com/thumbnail.jpg",
      videoUrl: "https://example.com/video.mp4",
    };

    const course = new Course(validCourse);
    const savedCourse = await course.save();

    expect(savedCourse._id).toBeDefined();
    expect(savedCourse.title).toBe(validCourse.title);
    expect(savedCourse.price).toBe(99.99);
  });

  it("should fail to create a course without required fields", async () => {
    const courseWithoutRequiredField = new Course({ title: "Test Course" });
    let err;

    try {
      await courseWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.description).toBeDefined();
  });
});
```

### 2. Integration Testing

```javascript
// tests/integration/routes/courses.test.js
const request = require("supertest");
const app = require("../../../index");
const mongoose = require("mongoose");
const Course = require("../../../models/Course");
const User = require("../../../models/User");
const { generateToken } = require("../../../utils/auth");

describe("Course Routes", () => {
  let token;
  let teacher;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    // Create test teacher
    teacher = await User.create({
      name: "Test Teacher",
      email: "teacher@test.com",
      password: "password123",
      role: "teacher",
    });

    token = generateToken(teacher._id);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Course.deleteMany({});
  });

  describe("GET /api/courses", () => {
    it("should return all published courses", async () => {
      const course = await Course.create({
        title: "Test Course",
        description: "Test Description",
        price: 99.99,
        category: "piano",
        level: "beginner",
        duration: 120,
        teacher: teacher._id,
        thumbnail: "https://example.com/thumbnail.jpg",
        videoUrl: "https://example.com/video.mp4",
        isPublished: true,
      });

      const response = await request(app).get("/api/courses").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("Test Course");
    });
  });

  describe("POST /api/courses", () => {
    it("should create a new course with valid token", async () => {
      const courseData = {
        title: "New Course",
        description: "New Description",
        price: 149.99,
        category: "guitar",
        level: "intermediate",
        duration: 180,
        thumbnail: "https://example.com/thumbnail.jpg",
        videoUrl: "https://example.com/video.mp4",
      };

      const response = await request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${token}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("New Course");
      expect(response.body.data.teacher).toBe(teacher._id.toString());
    });

    it("should reject request without authentication", async () => {
      const response = await request(app)
        .post("/api/courses")
        .send({ title: "Test Course" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
```

## Performance Guidelines

### 1. Database Optimization

```javascript
// Use indexes for frequently queried fields
courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ teacher: 1, isPublished: 1 });

// Use lean() for read-only operations
const courses = await Course.find({ isPublished: true }).lean().limit(10);

// Use select() to limit returned fields
const users = await User.find().select("name email role").lean();

// Use aggregation for complex queries
const courseStats = await Course.aggregate([
  { $match: { isPublished: true } },
  {
    $group: {
      _id: "$category",
      totalCourses: { $sum: 1 },
      averagePrice: { $avg: "$price" },
      totalEnrollments: { $sum: "$enrollmentCount" },
    },
  },
  { $sort: { totalCourses: -1 } },
]);
```

### 2. Caching Strategies

```javascript
// utils/cache.js
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default

const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    res.originalJson = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.originalJson(body);
    };

    next();
  };
};

// Usage
router.get("/courses", cacheMiddleware(300), async (req, res) => {
  const courses = await Course.find({ isPublished: true });
  res.json({ success: true, data: courses });
});
```

## Code Quality

### 1. ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error",
  },
};
```

### 2. Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## File Naming Conventions

### 1. Files and Directories

- Use **camelCase** for files: `userController.js`
- Use **camelCase** for directories: `middlewares/`
- Use **kebab-case** for test files: `user-controller.test.js`

### 2. Variables and Functions

- Use **camelCase** for variables and functions: `getUserById`
- Use **PascalCase** for classes: `UserController`
- Use **UPPER_SNAKE_CASE** for constants: `MAX_FILE_SIZE`

### 3. Database Collections

- Use **plural** and **camelCase**: `users`, `courseEnrollments`

## Git Commit Guidelines

### 1. Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### 2. Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security fixes

### 3. Examples

```
feat(auth): add JWT authentication middleware
fix(courses): resolve course creation validation issue
docs(api): update API documentation
style(middleware): format code with prettier
refactor(models): optimize database queries
test(routes): add integration tests for course routes
security(auth): implement rate limiting for login attempts
```

## Environment Configuration

### 1. Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=8080
DB_URI=mongodb://localhost:27017/music-platform
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
FRONTEND_URL=http://localhost:3000
```

### 2. Configuration Management

```javascript
// config/index.js
const config = {
  development: {
    port: process.env.PORT || 8080,
    database: {
      uri: process.env.DB_URI || "mongodb://localhost:27017/music-platform-dev",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: "7d",
    },
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    },
  },
  production: {
    port: process.env.PORT || 8080,
    database: {
      uri: process.env.DB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true,
        sslValidate: false,
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: "1d",
    },
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  },
};

module.exports = config[process.env.NODE_ENV || "development"];
```

## Conclusion

Following these guidelines will help maintain code quality, improve security, and ensure a consistent development experience across the team. Remember to:

1. **Review code regularly** and provide constructive feedback
2. **Keep learning** and stay updated with Node.js/Express best practices
3. **Document complex logic** and architectural decisions
4. **Write tests** for critical functionality
5. **Monitor performance** and optimize bottlenecks
6. **Follow security best practices** and keep dependencies updated

These guidelines should be treated as living documents that evolve with the project and team needs.
