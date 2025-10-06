const fs = require("fs");
let content = fs.readFileSync("services/bunnycdn.service.js", "utf8");

// Fix the syntax error by properly closing the previous method and adding the new method
const brokenCode = `      throw new Error(\`Failed to upload to Bunny CDN: \${error.message}\`);
    }
  /**
   * Upload a file buffer directly to Bunny Storage using HTTP API
   */
  async uploadBuffer(fileBuffer, fileName, folder = "") {`;

const fixedCode = `      throw new Error(\`Failed to upload to Bunny CDN: \${error.message}\`);
    }
  }

  /**
   * Upload a file buffer directly to Bunny Storage using HTTP API
   */
  async uploadBuffer(fileBuffer, fileName, folder = "") {`;

content = content.replace(brokenCode, fixedCode);

fs.writeFileSync("services/bunnycdn.service.js", content);
console.log("Fixed syntax error in Bunny CDN service!");
