const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-backend/routes/uploads.js", "utf8");

// Add missing upload routes for document and file uploads
const oldEnd = `});

module.exports = router;`;

const newEnd = `});

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
      url: `/uploads/${fileName}`,
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
      url: `/uploads/${fileName}`,
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

module.exports = router;`;

content = content.replace(oldEnd, newEnd);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-backend/routes/uploads.js", content);
console.log("Added missing upload routes for document and file uploads!");
