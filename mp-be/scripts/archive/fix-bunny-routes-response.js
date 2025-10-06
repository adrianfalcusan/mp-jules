const fs = require("fs");
let content = fs.readFileSync("routes/bunny-uploads.js", "utf8");

// Fix video upload route to extract URL from uploadBuffer response
const oldVideoResponse = `    res.json({ 
      success: true, 
      key: req.file.filename,
      url: bunnyUrl,
      message: "Video uploaded to Bunny CDN successfully" 
    });`;

const newVideoResponse = `    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Video uploaded to Bunny CDN successfully" 
    });`;

content = content.replace(oldVideoResponse, newVideoResponse);

// Fix audio upload route
const oldAudioResponse = `    res.json({ 
      success: true, 
      key: req.file.filename,
      url: bunnyUrl,
      message: "Audio uploaded to Bunny CDN successfully" 
    });`;

const newAudioResponse = `    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Audio uploaded to Bunny CDN successfully" 
    });`;

content = content.replace(oldAudioResponse, newAudioResponse);

// Fix document upload route
const oldDocumentResponse = `    res.json({ 
      success: true, 
      key: req.file.filename,
      url: bunnyUrl,
      message: "Document uploaded to Bunny CDN successfully" 
    });`;

const newDocumentResponse = `    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Document uploaded to Bunny CDN successfully" 
    });`;

content = content.replace(oldDocumentResponse, newDocumentResponse);

// Fix thumbnail upload route
const oldThumbnailResponse = `    res.json({ 
      success: true, 
      key: req.file.filename,
      url: bunnyUrl,
      message: "Thumbnail uploaded to Bunny CDN successfully" 
    });`;

const newThumbnailResponse = `    res.json({ 
      success: true, 
      key: bunnyUrl.fileName,
      url: bunnyUrl.url,
      message: "Thumbnail uploaded to Bunny CDN successfully" 
    });`;

content = content.replace(oldThumbnailResponse, newThumbnailResponse);

fs.writeFileSync("routes/bunny-uploads.js", content);
console.log("Fixed Bunny upload routes to extract URL from uploadBuffer response!");
