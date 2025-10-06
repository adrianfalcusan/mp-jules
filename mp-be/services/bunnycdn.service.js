// services/bunnycdn.service.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");
const BunnyCDNConfig = require("../config/bunny");
const CostProtectionManager = require("../utils/costProtection");
const logger = require("../utils/logger");

class BunnyCDNService {
  constructor() {
    this.config = new BunnyCDNConfig();
    this.costProtection = new CostProtectionManager();
  }

  /**
   * Upload a file directly to Bunny Storage using HTTP API
   */
  async uploadFile(filePath, fileName, folder = "") {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const uploadPath = folder ? `${folder}/${fileName}` : fileName;
      const uploadUrl = `${this.config.storageApiUrl}/${this.config.storageZoneName}/${uploadPath}`;

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
          : `https://${this.config.pullZoneUrl}`;
        // Construct proper CDN URL
        const cdnUrl = `${baseUrl}/${uploadPath}`;
        console.log("Bunny CDN URL constructed:", cdnUrl);
        console.log("Upload path:", uploadPath);
        console.log("Base URL:", baseUrl);
        logger.info(`File uploaded successfully to Bunny CDN: ${cdnUrl}`);
        return {
          success: true,
          url: cdnUrl,
          storageUrl: uploadUrl,
          fileName: fileName,
          folder: folder,
        };
      } else {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      logger.error("Bunny CDN upload error:", error);
      throw new Error(`Failed to upload to Bunny CDN: ${error.message}`);
    }
  }

  /**
   * Upload a file buffer directly to Bunny Storage using HTTP API
   */
  async uploadBuffer(fileBuffer, fileName, folder = "") {
    try {
      const uploadPath = folder ? `${folder}/${fileName}` : fileName;
      const uploadUrl = `${this.config.storageApiUrl}/${this.config.storageZoneName}/${uploadPath}`;

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
          : `https://${this.config.pullZoneUrl}`;
        const cdnUrl = `${baseUrl}/${uploadPath}`;
        
        console.log("Bunny CDN URL constructed:", cdnUrl);
        console.log("Base URL:", baseUrl);
        console.log("Upload path:", uploadPath);
        
        logger.info(`File uploaded successfully to Bunny CDN: ${cdnUrl}`);
        return {
          success: true,
          url: cdnUrl,
          storageUrl: uploadUrl,
          fileName: fileName,
          folder: folder,
        };
      } else {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      logger.error("Bunny CDN buffer upload error:", error);
      throw new Error(`Failed to upload to Bunny CDN: ${error.message}`);
    }
  }

  /**
   * Delete a file from Bunny Storage
   */
  async deleteFile(fileName, folder = "") {
    try {
      const deletePath = folder ? `${folder}/${fileName}` : fileName;
      const deleteUrl = `${this.config.storageApiUrl}/${this.config.storageZoneName}/${deletePath}`;

      const response = await axios.delete(deleteUrl, {
        headers: {
          AccessKey: process.env.BUNNY_STORAGE_PASSWORD,
        },
      });

      if (response.status === 200) {
        logger.info(`File deleted successfully from Bunny CDN: ${deletePath}`);
        return { success: true };
      } else {
        throw new Error(`Delete failed with status: ${response.status}`);
      }
    } catch (error) {
      logger.error("Bunny CDN delete error:", error);
      throw new Error(`Failed to delete from Bunny CDN: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder = "") {
    try {
      const listUrl = `${this.config.storageApiUrl}/${this.config.storageZoneName}/${folder}`;

      const response = await axios.get(listUrl, {
        headers: {
          AccessKey: process.env.BUNNY_STORAGE_PASSWORD,
        },
      });

      if (response.status === 200) {
        return {
          success: true,
          files: Array.isArray(response.data) ? response.data : [],
        };
      } else {
        throw new Error(`List failed with status: ${response.status}`);
      }
    } catch (error) {
      logger.error("Bunny CDN list error:", error);
      throw new Error(`Failed to list files from Bunny CDN: ${error.message}`);
    }
  }

  /**
   * Upload video with multiple quality processing
   */
  async uploadVideo(filePath, fileName, options = {}) {
    try {
      const { userTier = "free", generateThumbnail = true } = options;

      // Check cost protection
      const canStream = await this.costProtection.canUserStream(userTier);
      if (!canStream) {
        throw new Error("Cost protection: Upload temporarily disabled");
      }

      const results = {
        original: null,
        qualities: {},
        thumbnail: null,
        success: false,
      };

      // Upload original file
      const originalResult = await this.uploadFile(
        filePath,
        fileName,
        "videos/original"
      );
      results.original = originalResult;

      // TODO: Add video processing and thumbnail generation

      results.success = true;
      logger.info(`Video upload completed for ${fileName}`);

      return results;
    } catch (error) {
      logger.error("Video upload error:", error);
      throw error;
    }
  }

  /**
   * Process video to specific quality and upload
   */
  async processAndUploadQuality(inputPath, fileName, quality) {
    return new Promise((resolve, reject) => {
      const outputDir = path.join(
        process.env.TEMP_UPLOAD_DIR || "./temp-uploads",
        "processed"
      );
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileBaseName = path.parse(fileName).name;
      const outputPath = path.join(outputDir, `${fileBaseName}_${quality}.mp4`);
      const outputFileName = `${fileBaseName}_${quality}.mp4`;

      // Get quality settings
      const qualitySettings = this.config.getQualityPresets()[quality];
      if (!qualitySettings) {
        return reject(new Error(`Invalid quality: ${quality}`));
      }

      ffmpeg(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .size(qualitySettings.resolution)
        .videoBitrate(qualitySettings.videoBitrate)
        .audioBitrate(qualitySettings.audioBitrate)
        .format("mp4")
        .on("end", async () => {
          try {
            // Upload processed file
            const uploadResult = await this.uploadFile(
              outputPath,
              outputFileName,
              `videos/${quality}`
            );

            // Clean up local file
            fs.unlinkSync(outputPath);

            resolve(uploadResult);
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error) => {
          logger.error(`FFmpeg error for ${quality}:`, error);
          reject(error);
        })
        .save(outputPath);
    });
  }

  /**
   * Generate thumbnail and upload
   */
  async generateAndUploadThumbnail(videoPath, fileName) {
    return new Promise((resolve, reject) => {
      const outputDir = path.join(
        process.env.TEMP_UPLOAD_DIR || "./temp-uploads",
        "thumbnails"
      );
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileBaseName = path.parse(fileName).name;
      const thumbnailPath = path.join(outputDir, `${fileBaseName}_thumb.jpg`);
      const thumbnailFileName = `${fileBaseName}_thumb.jpg`;

      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          folder: outputDir,
          filename: `${fileBaseName}_thumb.jpg`,
          timemarks: [process.env.THUMBNAIL_POSITION || "10%"],
        })
        .on("end", async () => {
          try {
            // Optimize thumbnail with Sharp
            const optimizedPath = path.join(
              outputDir,
              `${fileBaseName}_thumb_optimized.jpg`
            );
            await sharp(thumbnailPath)
              .resize(1280, 720, {
                fit: "cover",
                position: "center",
              })
              .jpeg({
                quality: 85,
                progressive: true,
              })
              .toFile(optimizedPath);

            // Upload optimized thumbnail
            const uploadResult = await this.uploadFile(
              optimizedPath,
              thumbnailFileName,
              "thumbnails"
            );

            // Clean up local files
            fs.unlinkSync(thumbnailPath);
            fs.unlinkSync(optimizedPath);

            resolve(uploadResult);
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error) => {
          logger.error("Thumbnail generation error:", error);
          reject(error);
        });
    });
  }

  /**
   * Get streaming URL with cost protection
   */
  async getStreamingUrl(fileName, quality = "auto", userTier = "free") {
    try {
      // Check if user can stream
      const canStream = await this.costProtection.canUserStream(userTier);
      if (!canStream) {
        throw new Error("Streaming temporarily unavailable");
      }

      // Get best quality for user tier
      const maxQuality = this.costProtection.getMaxQualityForTier(userTier);
      const actualQuality = quality === "auto" ? maxQuality : quality;

      const fileBaseName = path.parse(fileName).name;
      const streamingUrl = `${this.config.pullZoneUrl}/videos/${actualQuality}/${fileBaseName}_${actualQuality}.mp4`;

      // Track bandwidth usage
      await this.costProtection.trackBandwidthUsage(userTier, 0); // Will be updated with actual usage

      return {
        url: streamingUrl,
        quality: actualQuality,
        maxQuality: maxQuality,
      };
    } catch (error) {
      logger.error("Get streaming URL error:", error);
      throw error;
    }
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(fileName) {
    const fileBaseName = path.parse(fileName).name;
    return `${this.config.pullZoneUrl}/thumbnails/${fileBaseName}_thumb.jpg`;
  }

  /**
   * Purge CDN cache for a file
   */
  async purgeCache(fileName) {
    try {
      const purgeUrl = `https://api.bunny.net/pullzone/${process.env.BUNNY_PULL_ZONE_ID}/purgeCache`;

      await axios.post(
        purgeUrl,
        {
          url: `${this.config.pullZoneUrl}/${fileName}`,
        },
        {
          headers: {
            AccessKey: process.env.BUNNY_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info(`Cache purged for ${fileName}`);
      return { success: true };
    } catch (error) {
      logger.error("Cache purge error:", error);
      throw error;
    }
  }
}

module.exports = BunnyCDNService;
