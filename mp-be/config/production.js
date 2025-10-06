const path = require("path");

module.exports = {
  // Database Configuration
  database: {
    uri: process.env.DB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: "majority",
    },
    retryConnect: {
      maxRetries: 5,
      retryDelayMs: 1000,
    },
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 8080,
    host: process.env.HOST || "0.0.0.0",
    cors: {
      origin: process.env.FRONTEND_URL || "https://your-frontend-domain.com",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    trust_proxy: true, // Important for apps behind load balancers
  },

  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: "7d",
      algorithm: "HS256",
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
    },
    authRateLimit: {
      windowMs: 60 * 1000, // 1 minute
      max: 5, // limit each IP to 5 auth requests per minute
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "https://api.stripe.com"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
  },

  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION,
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      signedUrlExpiry: 7200, // 2 hours
      uploadTimeout: 300000, // 5 minutes
      maxFileSize: 100 * 1024 * 1024, // 100MB
    },
    cloudfront: {
      distributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
      domain: process.env.AWS_CLOUDFRONT_DOMAIN,
    },
  },

  // Payment Configuration
  payments: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      successUrl: `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
    },
  },

  // Logging Configuration
  logging: {
    level: "info",
    format: "json",
    file: {
      enabled: true,
      filename: path.join(process.cwd(), "logs", "app.log"),
      maxSize: "20m",
      maxFiles: "14d",
    },
    console: {
      enabled: false, // Disable console logging in production
    },
    errorTracking: {
      enabled: process.env.SENTRY_DSN ? true : false,
      dsn: process.env.SENTRY_DSN,
      environment: "production",
      sampleRate: 1.0,
    },
  },

  // Email Configuration
  email: {
    provider: "sendgrid", // or "ses", "mailgun"
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.EMAIL_FROM || "adrianfalcusan.01@gmail.com",
    templates: {
      welcome: process.env.WELCOME_TEMPLATE_ID,
      resetPassword: process.env.RESET_PASSWORD_TEMPLATE_ID,
      courseEnrollment: process.env.COURSE_ENROLLMENT_TEMPLATE_ID,
    },
  },

  // Cache Configuration
  cache: {
    redis: {
      enabled: process.env.REDIS_URL ? true : false,
      url: process.env.REDIS_URL,
      ttl: 300, // 5 minutes default TTL
      maxRetriesPerRequest: 3,
    },
    memory: {
      enabled: true,
      maxSize: 100, // MB
      ttl: 300000, // 5 minutes in ms
    },
  },

  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: true,
      path: "/health",
      interval: 30000, // 30 seconds
    },
    metrics: {
      enabled: process.env.PROMETHEUS_ENABLED === "true",
      path: "/metrics",
    },
    uptime: {
      enabled: process.env.UPTIME_ROBOT_KEY ? true : false,
      apiKey: process.env.UPTIME_ROBOT_KEY,
    },
  },

  // File Upload Configuration
  uploads: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: {
      video: ["mp4", "avi", "mov", "wmv", "flv"],
      audio: ["mp3", "wav", "ogg", "aac", "flac"],
      image: ["jpg", "jpeg", "png", "gif", "webp"],
      document: ["pdf", "doc", "docx"],
    },
    storage: "s3", // or "local" for development
    tempDir: "/tmp/uploads",
    cleanupInterval: 3600000, // 1 hour
  },

  // Background Jobs Configuration
  jobs: {
    enabled: true,
    concurrency: 5,
    queues: {
      email: {
        concurrency: 2,
        retries: 3,
      },
      videoProcessing: {
        concurrency: 1,
        retries: 2,
        timeout: 600000, // 10 minutes
      },
      achievements: {
        concurrency: 3,
        retries: 1,
      },
    },
  },

  // Feature Flags
  features: {
    achievement_system: true,
    video_streaming: true,
    live_classes: false, // Future feature
    social_features: false, // Future feature
    ai_recommendations: false, // Future feature
  },

  // Performance Configuration
  performance: {
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024,
    },
    static: {
      maxAge: "1y",
      immutable: true,
    },
    apiCache: {
      courses: 300, // 5 minutes
      tutorials: 300, // 5 minutes
      achievements: 600, // 10 minutes
      user_progress: 60, // 1 minute
    },
  },

  // Environment Validation
  requiredEnvVars: [
    "DB_URI",
    "JWT_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "AWS_REGION",
    "AWS_S3_BUCKET",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "FRONTEND_URL",
  ],

  // Health Check Configuration
  healthChecks: [
    {
      name: "database",
      check: async () => {
        const mongoose = require("mongoose");
        return mongoose.connection.readyState === 1;
      },
    },
    {
      name: "s3",
      check: async () => {
        const { S3Client, HeadBucketCommand } = require("@aws-sdk/client-s3");
        const s3 = new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
        try {
          await s3.send(
            new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET })
          );
          return true;
        } catch (error) {
          return false;
        }
      },
    },
    {
      name: "stripe",
      check: async () => {
        try {
          const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
          await stripe.balance.retrieve();
          return true;
        } catch (error) {
          return false;
        }
      },
    },
  ],
};

// Validate required environment variables
const validateEnvironment = () => {
  const missing = module.exports.requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
};

// Export validation function
module.exports.validateEnvironment = validateEnvironment;
