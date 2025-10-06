const fs = require("fs");
let content = fs.readFileSync("routes/bunny-uploads.js", "utf8");

// Fix the Bunny CDN thumbnail upload to actually use Bunny CDN instead of local storage
const oldThumbnailUpload = `// Upload thumbnail to Bunny CDN
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
    const fileName = \`thumbnail-\${timestamp}.\${fileExtension}\`;
    
    // Use local storage for immediate functionality
    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const localPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localPath, req.file.buffer);
    
    const localUrl = \`http://localhost:8080/uploads/\${fileName}\`;
    
    res.json({ 
      success: true, 
      key: fileName,
      url: localUrl,
      message: "Thumbnail uploaded to local storage successfully" 
    });
  } catch (error) {
    console.error("Bunny CDN thumbnail upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Thumbnail upload to Bunny CDN failed: " + error.message 
    });
  }
});`;

const newThumbnailUpload = `// Upload thumbnail to Bunny CDN
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
    const fileName = \`thumbnail-\${timestamp}.\${fileExtension}\`;

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

      const localUrl = \`http://localhost:8080/uploads/\${fileName}\`;

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
});`;

content = content.replace(oldThumbnailUpload, newThumbnailUpload);

fs.writeFileSync("routes/bunny-uploads.js", content);
console.log("✅ Fixed Bunny CDN thumbnail upload to actually use Bunny CDN!");
