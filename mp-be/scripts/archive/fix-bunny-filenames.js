const fs = require("fs");
let content = fs.readFileSync("routes/bunny-uploads.js", "utf8");

// Fix video upload to generate proper filename
const oldVideoUpload = `    console.log("Uploading video to Bunny CDN:", req.file.originalname);
    
    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`videos/\${req.file.filename}\`,
      req.file.mimetype
    );`;

const newVideoUpload = `    console.log("Uploading video to Bunny CDN:", req.file.originalname);
    
    // Generate proper filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split(".").pop() || "mp4";
    const fileName = \`video-\${timestamp}.\${fileExtension}\`;
    
    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`videos/\${fileName}\`,
      req.file.mimetype
    );`;

content = content.replace(oldVideoUpload, newVideoUpload);

// Fix audio upload to generate proper filename
const oldAudioUpload = `    console.log("Uploading audio to Bunny CDN:", req.file.originalname);
    
    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`audio/\${req.file.filename}\`,
      req.file.mimetype
    );`;

const newAudioUpload = `    console.log("Uploading audio to Bunny CDN:", req.file.originalname);
    
    // Generate proper filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split(".").pop() || "mp3";
    const fileName = \`audio-\${timestamp}.\${fileExtension}\`;
    
    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`audio/\${fileName}\`,
      req.file.mimetype
    );`;

content = content.replace(oldAudioUpload, newAudioUpload);

// Fix document upload to generate proper filename
const oldDocumentUpload = `    console.log("Uploading document to Bunny CDN:", req.file.originalname);
    
    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`documents/\${req.file.filename}\`,
      req.file.mimetype
    );`;

const newDocumentUpload = `    console.log("Uploading document to Bunny CDN:", req.file.originalname);
    
    // Generate proper filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split(".").pop() || "pdf";
    const fileName = \`document-\${timestamp}.\${fileExtension}\`;
    
    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`documents/\${fileName}\`,
      req.file.mimetype
    );`;

content = content.replace(oldDocumentUpload, newDocumentUpload);

// Fix thumbnail upload to generate proper filename
const oldThumbnailUpload = `    console.log("Uploading thumbnail to Bunny CDN:", req.file.originalname);
    
    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`thumbnails/\${req.file.filename}\`,
      req.file.mimetype
    );`;

const newThumbnailUpload = `    console.log("Uploading thumbnail to Bunny CDN:", req.file.originalname);
    
    // Generate proper filename
    const timestamp = Date.now();
    const fileExtension = req.file.originalname.split(".").pop() || "jpg";
    const fileName = \`thumbnail-\${timestamp}.\${fileExtension}\`;
    
    // Upload to Bunny CDN
    const bunnyUrl = await bunnyService.uploadBuffer(
      req.file.buffer,
      \`thumbnails/\${fileName}\`,
      req.file.mimetype
    );`;

content = content.replace(oldThumbnailUpload, newThumbnailUpload);

fs.writeFileSync("routes/bunny-uploads.js", content);
console.log("Fixed Bunny upload routes to generate proper filenames!");
