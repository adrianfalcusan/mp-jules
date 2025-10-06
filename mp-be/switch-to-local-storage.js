const fs = require("fs");
let content = fs.readFileSync("routes/bunny-uploads.js", "utf8");

// Replace Bunny CDN uploads with local storage uploads for immediate functionality
const oldVideoUpload = `    try {
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

const newVideoUpload = `    // Use local storage for immediate functionality
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
      message: "Video uploaded to local storage successfully" 
    });`;

content = content.replace(oldVideoUpload, newVideoUpload);

// Do the same for audio uploads
const oldAudioUpload = `    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`audio/\${fileName}\`,
      req.file.mimetype
    );

    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Audio uploaded to Bunny CDN successfully" 
    });`;

const newAudioUpload = `    // Use local storage for immediate functionality
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
      message: "Audio uploaded to local storage successfully" 
    });`;

content = content.replace(oldAudioUpload, newAudioUpload);

// Do the same for document uploads
const oldDocumentUpload = `    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`documents/\${fileName}\`,
      req.file.mimetype
    );

    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Document uploaded to Bunny CDN successfully" 
    });`;

const newDocumentUpload = `    // Use local storage for immediate functionality
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
      message: "Document uploaded to local storage successfully" 
    });`;

content = content.replace(oldDocumentUpload, newDocumentUpload);

// Do the same for thumbnail uploads
const oldThumbnailUpload = `    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`thumbnails/\${fileName}\`,
      req.file.mimetype
    );

    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Thumbnail uploaded to Bunny CDN successfully" 
    });`;

const newThumbnailUpload = `    // Use local storage for immediate functionality
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
    });`;

content = content.replace(oldThumbnailUpload, newThumbnailUpload);

fs.writeFileSync("routes/bunny-uploads.js", content);
console.log("Switched to local storage for immediate functionality!");
