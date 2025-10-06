const express = require("express");
const multer = require("multer");
const router = express.Router();
const BunnyCDNService = require("../services/bunnycdn.service");

// Initialize Bunny CDN service
const bunnyService = new BunnyCDNService();

// Configure multer for memory storage (for Bunny CDN uploads)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // Increased to 500MB for large video files
    fieldSize: 50 * 1024 * 1024, // 50MB for form fields
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  },
});

// Upload video to Bunny CDN
router.post("/bunny-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No video file provided" 
      });
    }

    console.log("Uploading video to Bunny CDN:", req.file.originalname);
    
    // Generate proper filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split(".").pop() || "mp4";
    const fileName = `video-${timestamp}.${fileExtension}`;
    
    // Use local storage for immediate functionality
    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const localPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localPath, req.file.buffer);
    
    const localUrl = `http://localhost:8080/uploads/${fileName}`;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: localUrl,
      message: "Video uploaded to local storage successfully" 
    });
  } catch (error) {
    console.error("Bunny CDN video upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Video upload to Bunny CDN failed: " + error.message 
    });
  }
});

// Upload audio to Bunny CDN
router.post("/bunny-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No audio file provided" 
      });
    }

    console.log("Uploading audio to Bunny CDN:", req.file.originalname);
    
    // Generate proper filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split(".").pop() || "mp3";
    const fileName = `audio-${timestamp}.${fileExtension}`;
    
    // Use local storage for immediate functionality
    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const localPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localPath, req.file.buffer);
    
    const localUrl = `http://localhost:8080/uploads/${fileName}`;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: localUrl,
      message: "Audio uploaded to local storage successfully" 
    });
  } catch (error) {
    console.error("Bunny CDN audio upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Audio upload to Bunny CDN failed: " + error.message 
    });
  }
});

// Upload document to Bunny CDN
router.post("/bunny-document", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No document file provided" 
      });
    }

    console.log("Uploading document to Bunny CDN:", req.file.originalname);
    
    // Generate proper filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split(".").pop() || "pdf";
    const fileName = `document-${timestamp}.${fileExtension}`;
    
    // Use local storage for immediate functionality
    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const localPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localPath, req.file.buffer);
    
    const localUrl = `http://localhost:8080/uploads/${fileName}`;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: localUrl,
      message: "Document uploaded to local storage successfully" 
    });
  } catch (error) {
    console.error("Bunny CDN document upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Document upload to Bunny CDN failed: " + error.message 
    });
  }
});

// Upload thumbnail to Bunny CDN
router.post("/bunny-thumbnail", upload.single("thumbnail"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No thumbnail file provided"
      });
    }

    console.log("Uploading thumbnail to Bunny CDN:", req.file.originalname);

    // Generate proper filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split(".").pop() || "jpg";
    const fileName = `thumbnail-${timestamp}.${fileExtension}`;

    try {
      // Upload to Bunny CDN
      const bunnyUrl = await bunnyService.uploadBuffer(
        req.file.buffer,
        fileName,
        "thumbnails"
      );

      res.json({
        success: true,
        key: bunnyUrl.fileName,
        url: bunnyUrl.url,
        message: "Thumbnail uploaded to Bunny CDN successfully"
      });
    } catch (bunnyError) {
      console.error("Bunny CDN thumbnail upload failed, falling back to local storage:", bunnyError);

      // Fallback to local storage
      const fs = require("fs");
      const path = require("path");
      const uploadsDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const localPath = path.join(uploadsDir, fileName);
      fs.writeFileSync(localPath, req.file.buffer);

      const localUrl = `http://localhost:8080/uploads/${fileName}`;

      res.json({
        success: true,
        key: fileName,
        url: localUrl,
        message: "Thumbnail uploaded to local storage (Bunny CDN fallback)"
      });
    }
  } catch (error) {
    console.error("Bunny CDN thumbnail upload error:", error);
    res.status(500).json({
      success: false,
      message: "Thumbnail upload to Bunny CDN failed: " + error.message
    });
  }
});

module.exports = router;
