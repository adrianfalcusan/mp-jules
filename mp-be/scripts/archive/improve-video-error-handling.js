const fs = require("fs");
let content = fs.readFileSync("routes/uploads.js", "utf8");

// Improve error handling for large video uploads
const oldVideoUpload = `// Video upload endpoint
router.post("/video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No video file provided" 
      });
    }

    console.log("Video upload details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename
    });

    const fileName = req.file.filename;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: \`http://localhost:8080/uploads/\${fileName}\`,
      message: "Video uploaded successfully" 
    });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Video upload failed: " + error.message 
    });
  }
});`;

const newVideoUpload = `// Video upload endpoint with better error handling
router.post("/video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided"
      });
    }

    console.log("Video upload details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename
    });

    // Check for common video file size issues
    if (req.file.size > 500 * 1024 * 1024) {
      console.warn("Large video file detected:", req.file.size);
    }

    const fileName = req.file.filename;

    res.json({
      success: true,
      key: fileName,
      url: \`http://localhost:8080/uploads/\${fileName}\`,
      message: "Video uploaded successfully"
    });
  } catch (error) {
    console.error("Video upload error:", error);

    // Provide more specific error messages
    let errorMessage = "Video upload failed";
    if (error.code === "LIMIT_FILE_SIZE") {
      errorMessage = "Video file is too large. Maximum size is 500MB.";
    } else if (error.message.includes("MULTER")) {
      errorMessage = "File upload error. Please try again.";
    } else {
      errorMessage = "Video upload failed: " + error.message;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});`;

content = content.replace(oldVideoUpload, newVideoUpload);

fs.writeFileSync("routes/uploads.js", content);
console.log("✅ Improved error handling for large video uploads!");
