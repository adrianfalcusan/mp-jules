const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
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
});

// Thumbnail upload endpoint
router.post("/thumbnail", upload.single("thumbnail"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No thumbnail file provided" 
      });
    }

    const fileName = req.file.filename;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: `http://localhost:8080/uploads/${fileName}`,
      message: "Thumbnail uploaded successfully" 
    });
  } catch (error) {
    console.error("Thumbnail upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Thumbnail upload failed" 
    });
  }
});

// Video upload endpoint with better error handling
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
      url: `http://localhost:8080/uploads/${fileName}`,
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
});

// PDF upload endpoint
router.post("/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No PDF file provided" 
      });
    }

    const fileName = req.file.filename;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: `http://localhost:8080/uploads/${fileName}`,
      message: "PDF uploaded successfully" 
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "PDF upload failed" 
    });
  }
});

// Audio upload endpoint
router.post("/audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No audio file provided" 
      });
    }

    const fileName = req.file.filename;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: `http://localhost:8080/uploads/${fileName}`,
      message: "Audio uploaded successfully" 
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Audio upload failed" 
    });
  }
});

module.exports = router;
// Document upload endpoint (for PDFs and other documents)
router.post("/document", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No document file provided" 
      });
    }

    const fileName = req.file.filename;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: `http://localhost:8080/uploads/${fileName}`,
      message: "Document uploaded successfully" 
    });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Document upload failed" 
    });
  }
});

// File upload endpoint (for any other files)
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file provided" 
      });
    }

    const fileName = req.file.filename;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: `http://localhost:8080/uploads/${fileName}`,
      message: "File uploaded successfully" 
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "File upload failed" 
    });
  }
});
