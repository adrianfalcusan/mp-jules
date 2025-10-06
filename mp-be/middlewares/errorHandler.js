// middlewares/errorHandler.js
const logger = require("../utils/logger");

module.exports.notFound = (req, res, _next) => {
  logger.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
  });
  res.status(404).json({ success: false, message: "Not found" });
};

module.exports.errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Server error";

  // Log the error with context
  logger.error("Application Error", {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id,
      body: req.method !== "GET" ? req.body : undefined,
    },
    statusCode: status,
  });

  res.status(status).json({ success: false, message });
};
