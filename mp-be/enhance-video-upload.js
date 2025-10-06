const fs = require("fs");
let content = fs.readFileSync("routes/uploads.js", "utf8");

// Increase file size limit for video uploads
const oldLimits = `  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },`;

const newLimits = `  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },`;

content = content.replace(oldLimits, newLimits);

// Add better error handling to video upload
const oldVideoUpload = `router.post("/video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No video file provided" 
      });
    }

    const fileName = req.file.filename;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: \`/uploads/\${fileName}\`,
      message: "Video uploaded successfully" 
    });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Video upload failed" 
    });
  }
});`;

const newVideoUpload = `router.post("/video", upload.single("video"), async (req, res) => {
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
      url: \`/uploads/\${fileName}\`,
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

content = content.replace(oldVideoUpload, newVideoUpload);

fs.writeFileSync("routes/uploads.js", content);
console.log("Enhanced video upload with better error handling and increased file size limit!");
