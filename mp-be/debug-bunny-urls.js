const fs = require("fs");
let content = fs.readFileSync("services/bunnycdn.service.js", "utf8");

// Fix the URL construction to properly handle folder paths
const oldUrlConstruction = `        const cdnUrl = \`\${baseUrl}/\${uploadPath}\`;`;

const newUrlConstruction = `        // Construct proper CDN URL
        const cdnUrl = \`\${baseUrl}/\${uploadPath}\`;
        console.log("Bunny CDN URL constructed:", cdnUrl);
        console.log("Upload path:", uploadPath);
        console.log("Base URL:", baseUrl);`;

content = content.replace(oldUrlConstruction, newUrlConstruction);

fs.writeFileSync("services/bunnycdn.service.js", content);
console.log("Added debugging to Bunny CDN URL construction!");
