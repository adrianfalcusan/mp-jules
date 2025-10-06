const fs = require("fs");
let content = fs.readFileSync("services/bunnycdn.service.js", "utf8");

// Add a new method to handle Buffer uploads
const newMethod = `  /**
   * Upload a file buffer directly to Bunny Storage using HTTP API
   */
  async uploadBuffer(fileBuffer, fileName, folder = "") {
    try {
      const uploadPath = folder ? \`\${folder}/\${fileName}\` : fileName;
      const uploadUrl = \`\${this.config.storageApiUrl}/\${this.config.storageZoneName}/\${uploadPath}\`;

      const response = await axios.put(uploadUrl, fileBuffer, {
        headers: {
          AccessKey: process.env.BUNNY_STORAGE_PASSWORD,
          "Content-Type": "application/octet-stream",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (response.status === 201) {
        // Ensure the URL always has https:// protocol
        const baseUrl = this.config.pullZoneUrl.startsWith("http")
          ? this.config.pullZoneUrl
          : \`https://\${this.config.pullZoneUrl}\`;
        const cdnUrl = \`\${baseUrl}/\${uploadPath}\`;
        logger.info(\`File uploaded successfully to Bunny CDN: \${cdnUrl}\`);
        return {
          success: true,
          url: cdnUrl,
          storageUrl: uploadUrl,
          fileName: fileName,
          folder: folder,
        };
      } else {
        throw new Error(\`Upload failed with status: \${response.status}\`);
      }
    } catch (error) {
      logger.error("Bunny CDN buffer upload error:", error);
      throw new Error(\`Failed to upload to Bunny CDN: \${error.message}\`);
    }
  }`;

// Insert the new method after the existing uploadFile method
const insertPoint = "  }\n\n  /**\n   * Delete a file from Bunny Storage\n   */";
content = content.replace(insertPoint, newMethod + "\n\n  /**\n   * Delete a file from Bunny Storage\n   */");

fs.writeFileSync("services/bunnycdn.service.js", content);
console.log("Added uploadBuffer method to Bunny CDN service!");
