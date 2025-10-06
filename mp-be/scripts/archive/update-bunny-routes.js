const fs = require("fs");
let content = fs.readFileSync("routes/bunny-uploads.js", "utf8");

// Update all uploadFile calls to use uploadBuffer
content = content.replace(/await bunnyService\.uploadFile\(/g, "await bunnyService.uploadBuffer(");

fs.writeFileSync("routes/bunny-uploads.js", content);
console.log("Updated Bunny upload routes to use uploadBuffer method!");
