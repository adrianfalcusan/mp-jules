const fs = require("fs");
let content = fs.readFileSync("services/bunnycdn.service.js", "utf8");

// Fix the uploadBuffer method to construct URLs correctly
const oldUploadBuffer = `  async uploadBuffer(fileBuffer, fileName, folder = "") {
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

const newUploadBuffer = `  async uploadBuffer(fileBuffer, fileName, folder = "") {
    try {
      const uploadPath = folder ? \`\${folder}/\${fileName}\` : fileName;
      const uploadUrl = \`\${this.config.storageApiUrl}/\${this.config.storageZoneName}/\${uploadPath}\`;

      console.log("Bunny CDN Upload Debug:", {
        fileName: fileName,
        folder: folder,
        uploadPath: uploadPath,
        uploadUrl: uploadUrl,
        pullZoneUrl: this.config.pullZoneUrl
      });

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
        
        console.log("Bunny CDN URL constructed:", cdnUrl);
        console.log("Base URL:", baseUrl);
        console.log("Upload path:", uploadPath);
        
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

content = content.replace(oldUploadBuffer, newUploadBuffer);

fs.writeFileSync("services/bunnycdn.service.js", content);
console.log("Fixed Bunny CDN URL construction!");
