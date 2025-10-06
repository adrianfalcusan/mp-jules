const fs = require("fs");
let content = fs.readFileSync("routes/bunny-uploads.js", "utf8");

// Revert back to Bunny CDN but fix the URL construction
const oldVideoUpload = `    // Use local storage for immediate functionality
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

const newVideoUpload = `    // Upload to Bunny CDN with proper path
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      fileName, // Just the filename, not with videos/ prefix
      "videos" // Pass folder as separate parameter
    );

    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Video uploaded to Bunny CDN successfully" 
    });`;

content = content.replace(oldVideoUpload, newVideoUpload);

// Fix audio uploads
const oldAudioUpload = `    // Use local storage for immediate functionality
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

const newAudioUpload = `    // Upload to Bunny CDN with proper path
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      fileName, // Just the filename, not with audio/ prefix
      "audio" // Pass folder as separate parameter
    );

    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Audio uploaded to Bunny CDN successfully" 
    });`;

content = content.replace(oldAudioUpload, newAudioUpload);

// Fix document uploads
const oldDocumentUpload = `    // Use local storage for immediate functionality
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

const newDocumentUpload = `    // Upload to Bunny CDN with proper path
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      fileName, // Just the filename, not with documents/ prefix
      "documents" // Pass folder as separate parameter
    );

    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Document uploaded to Bunny CDN successfully" 
    });`;

content = content.replace(oldDocumentUpload, newDocumentUpload);

// Fix thumbnail uploads
const oldThumbnailUpload = `    // Use local storage for immediate functionality
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

const newThumbnailUpload = `    // Upload to Bunny CDN with proper path
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      fileName, // Just the filename, not with thumbnails/ prefix
      "thumbnails" // Pass folder as separate parameter
    );

    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Thumbnail uploaded to Bunny CDN successfully" 
    });`;

content = content.replace(oldThumbnailUpload, newThumbnailUpload);

fs.writeFileSync("routes/bunny-uploads.js", content);
console.log("Fixed Bunny CDN upload paths!");
