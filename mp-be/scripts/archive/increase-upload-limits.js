const fs = require("fs");
let content = fs.readFileSync("routes/uploads.js", "utf8");

// Increase file size limits and improve error handling for large videos
const oldUploadConfig = `const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/", "video/", "application/pdf", "audio/"];
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  }
});`;

const newUploadConfig = `const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // Increased to 500MB for large video files
    fieldSize: 50 * 1024 * 1024, // 50MB for form fields
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/", "video/", "application/pdf", "audio/"];
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  }
});`;

content = content.replace(oldUploadConfig, newUploadConfig);

fs.writeFileSync("routes/uploads.js", content);
console.log("✅ Increased file size limits to 500MB for large video uploads!");
