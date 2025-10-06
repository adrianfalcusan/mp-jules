// middlewares/uploadVideoBunny.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const BunnyCDNService = require("../services/bunnycdn.service");
const CostProtectionManager = require("../utils/costProtection");
const logger = require("../utils/logger");

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "temp-uploads");

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${extension}`);
  },
});

// File filter for video uploads
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimeTypes = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
  ];

  const allowedExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB max file size
    files: 1, // Only one file at a time
  },
});

// SIMPLIFIED Middleware to handle video upload to Bunny CDN
const uploadVideoToBunny = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    // Upload file directly to Bunny CDN
    const bunnyService = new BunnyCDNService();

    const fileName = `video-${Date.now()}.mp4`;
    const uploadResult = await bunnyService.uploadFile(
      req.file.path,
      fileName,
      "videos"
    );

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    // Add result to request for route handler
    req.bunnyUpload = {
      success: true,
      videoUrl: uploadResult.url,
      thumbnailUrl: null,
      qualities: ["original"],
      duration: 0,
      videoKey: uploadResult.folder
        ? `${uploadResult.folder}/${uploadResult.fileName}`
        : uploadResult.fileName,
    };

    logger.info("Video uploaded successfully to Bunny CDN", {
      fileName,
      videoUrl: uploadResult.url,
      fileSize: req.file.size,
    });

    next();
  } catch (error) {
    logger.error("Video upload to Bunny CDN failed:", error);

    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: "Video upload failed. Please try again.",
      error: error.message,
    });
  }
};

// Array upload for course videos
const uploadVideosArray = multer({ storage, fileFilter }).array("videos", 20);
const uploadVideosArrayToBunny = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No video files provided" });
    }
    const bunny = new BunnyCDNService();
    const results = [];
    for (const f of req.files) {
      const fileName = `video-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(f.originalname)}`;
      const uploaded = await bunny.uploadFile(f.path, fileName, "videos");
      results.push({
        url: uploaded.url,
        key: uploaded.folder
          ? `${uploaded.folder}/${uploaded.fileName}`
          : uploaded.fileName,
      });
      try {
        fs.unlinkSync(f.path);
      } catch {}
    }
    req.bunnyMultiUpload = results;
    next();
  } catch (err) {
    logger.error("Multi video upload error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Multi video upload failed" });
  }
};

// Configure thumbnail upload
const makeThumbMulterSingle = (fieldName) =>
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "..", "temp-uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `thumbnail-${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only images are allowed."), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  }).single(fieldName);

const uploadThumbnail = makeThumbMulterSingle("thumbnail");
const uploadThumbnailAlt = makeThumbMulterSingle("file");

// Middleware to accept either 'thumbnail' or 'file'
const uploadThumbnailFlexible = (req, res, next) => {
  uploadThumbnail(req, res, (err) => {
    if (err) return next(err);
    if (req.file) return next();
    uploadThumbnailAlt(req, res, (err2) => {
      return next(err2);
    });
  });
};

// Simplified thumbnail upload to Bunny CDN
const uploadThumbnailToBunny = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No thumbnail file provided",
      });
    }

    const bunnyService = new BunnyCDNService();
    const fileName = `thumbnail-${Date.now()}.jpg`;

    const uploadResult = await bunnyService.uploadFile(
      req.file.path,
      fileName,
      "thumbnails"
    );

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    // Add result to request
    req.bunnyThumbnail = {
      success: true,
      thumbnailUrl: uploadResult.url,
    };

    next();
  } catch (error) {
    logger.error("Thumbnail upload to Bunny CDN failed:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: "Thumbnail upload failed. Please try again.",
      error: error.message,
    });
  }
};

// Multitrack audio upload (array)
const audioMulter = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, "..", "temp-uploads");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, `track-${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/flac",
      "audio/ogg",
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Invalid audio type"), false);
  },
  limits: { files: 20, fileSize: 200 * 1024 * 1024 },
});

const uploadMultitracksArray = audioMulter.array("multitracks", 20);
const uploadMultitracksToBunny = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No multitrack files provided" });
    }
    const bunny = new BunnyCDNService();
    const results = [];
    for (const f of req.files) {
      const filename = `track-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(f.originalname)}`;
      const uploaded = await bunny.uploadFile(f.path, filename, "multitracks");
      results.push({ name: f.originalname, url: uploaded.url, type: "other" });
      try {
        fs.unlinkSync(f.path);
      } catch {}
    }
    req.bunnyMultitracks = results;
    next();
  } catch (err) {
    logger.error("Multitrack upload error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Multitrack upload failed" });
  }
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message:
            "File too large. Maximum size is 5GB for videos, 10MB for thumbnails.",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files. Only one file allowed per upload.",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field. Please check your form data.",
        });
      default:
        return res.status(400).json({
          success: false,
          message: error.message,
        });
    }
  }

  // Pass other errors to global error handler
  next(error);
};

// Clean up temp files utility
const cleanupTempFiles = (
  tempDir = path.join(__dirname, "..", "temp-uploads")
) => {
  try {
    const files = fs.readdirSync(tempDir);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    files.forEach((file) => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime.getTime() < oneHourAgo) {
        fs.unlinkSync(filePath);
        logger.info(`Cleaned up old temp file: ${file}`);
      }
    });
  } catch (error) {
    logger.warn(`Temp file cleanup failed: ${error.message}`);
  }
};

module.exports = {
  uploadVideo: upload.single("video"),
  uploadVideoToBunny,
  uploadVideosArray,
  uploadVideosArrayToBunny,
  uploadThumbnail: uploadThumbnailFlexible,
  uploadThumbnailToBunny,
  uploadMultitracksArray,
  uploadMultitracksToBunny,
  handleMulterError,
  cleanupTempFiles,
};
