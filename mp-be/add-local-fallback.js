const fs = require("fs");
let content = fs.readFileSync("routes/bunny-uploads.js", "utf8");

// Add fallback to local storage if Bunny CDN fails
const oldVideoUpload = `    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`videos/\${fileName}\`,
      req.file.mimetype
    );

    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Video uploaded to Bunny CDN successfully" 
    });`;

const newVideoUpload = `    try {
      // Upload to Bunny CDN
      const bunnyUrl = await bunnyService.uploadBuffer(
        req.file.buffer,
        \`videos/\${fileName}\`,
        req.file.mimetype
      );

      res.json({ 
        success: true, 
        key: bunnyUrl.fileName,
        url: bunnyUrl.url,
        message: "Video uploaded to Bunny CDN successfully" 
      });
    } catch (bunnyError) {
      console.error("Bunny CDN upload failed, falling back to local storage:", bunnyError);
      
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
        message: "Video uploaded to local storage (Bunny CDN fallback)" 
      });
    }`;

content = content.replace(oldVideoUpload, newVideoUpload);

fs.writeFileSync("routes/bunny-uploads.js", content);
console.log("Added fallback to local storage for video uploads!");
