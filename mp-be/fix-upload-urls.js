const fs = require("fs");
let content = fs.readFileSync("routes/uploads.js", "utf8");

// Fix video upload response to return full URL
const oldVideoResponse = `    res.json({ 
      success: true, 
      key: fileName,
      url: \`/uploads/\${fileName}\`,
      message: "Video uploaded successfully" 
    });`;

const newVideoResponse = `    res.json({ 
      success: true, 
      key: fileName,
      url: \`http://localhost:8080/uploads/\${fileName}\`,
      message: "Video uploaded successfully" 
    });`;

content = content.replace(oldVideoResponse, newVideoResponse);

// Also fix other upload responses
content = content.replace(/url: \`\/uploads\//g, "url: \`http://localhost:8080/uploads/");

fs.writeFileSync("routes/uploads.js", content);
console.log("Fixed upload responses to return full URLs!");
