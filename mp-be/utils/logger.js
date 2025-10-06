// utils/logger.js
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

// Create logs directory if it doesn't exist
const fs = require("fs");
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;

    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Create transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "warn" : "debug",
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true,
  }),

  // File transport for all logs
  new DailyRotateFile({
    filename: path.join(logsDir, "application-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "info",
    format: logFormat,
    handleExceptions: true,
    handleRejections: true,
  }),

  // Separate file for errors
  new DailyRotateFile({
    filename: path.join(logsDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: "error",
    format: logFormat,
    handleExceptions: true,
    handleRejections: true,
  }),
];

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports,
  exitOnError: false,
});

// Add request logging helper
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id,
    userRole: req.user?.role,
  };

  if (res.statusCode >= 400) {
    logger.warn("HTTP Request Error", logData);
  } else {
    logger.info("HTTP Request", logData);
  }
};

// Add authentication logging
logger.logAuth = (action, userId, email, ip, success = true, error = null) => {
  const logData = {
    action,
    userId,
    email,
    ip,
    success,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    logData.error = error;
  }

  if (success) {
    logger.info(`Authentication: ${action}`, logData);
  } else {
    logger.warn(`Authentication Failed: ${action}`, logData);
  }
};

// Add payment logging
logger.logPayment = (
  action,
  userId,
  amount,
  currency,
  paymentId,
  success = true,
  error = null
) => {
  const logData = {
    action,
    userId,
    amount,
    currency,
    paymentId,
    success,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    logData.error = error;
  }

  if (success) {
    logger.info(`Payment: ${action}`, logData);
  } else {
    logger.error(`Payment Failed: ${action}`, logData);
  }
};

// Add database operation logging
logger.logDB = (operation, collection, query, result, error = null) => {
  const logData = {
    operation,
    collection,
    query: typeof query === "object" ? JSON.stringify(query) : query,
    resultCount: Array.isArray(result) ? result.length : result ? 1 : 0,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    logData.error = error.message || error;
    logger.error(`Database Error: ${operation}`, logData);
  } else {
    logger.debug(`Database: ${operation}`, logData);
  }
};

// Add security event logging
logger.logSecurity = (event, userId, ip, details = {}) => {
  const logData = {
    event,
    userId,
    ip,
    ...details,
    timestamp: new Date().toISOString(),
  };

  logger.warn(`Security Event: ${event}`, logData);
};

// Production error handler
if (process.env.NODE_ENV === "production") {
  logger.on("error", (error) => {
    console.error("Logger error:", error);
  });
}

module.exports = logger;
