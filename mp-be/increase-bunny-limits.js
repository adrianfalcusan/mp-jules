const fs = require("fs");
let content = fs.readFileSync("routes/bunny-uploads.js", "utf8");

// Increase file size limits for Bunny CDN uploads too
const oldBunnyUploadConfig = `const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  },
});`;

const newBunnyUploadConfig = `const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // Increased to 500MB for large video files
    fieldSize: 50 * 1024 * 1024, // 50MB for form fields
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  },
});`;

content = content.replace(oldBunnyUploadConfig, newBunnyUploadConfig);

fs.writeFileSync("routes/bunny-uploads.js", content);
console.log("✅ Increased Bunny CDN upload limits to 500MB for large video files!");
