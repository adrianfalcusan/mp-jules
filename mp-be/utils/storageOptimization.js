// utils/storageOptimization.js
const AWS = require("aws-sdk");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

// Configure AWS S3 with multiple storage classes
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const cloudFront = new AWS.CloudFront({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

class StorageOptimizer {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;

    // Storage class configurations
    this.storageClasses = {
      hot: "STANDARD", // 0-30 days - $0.023/GB
      warm: "STANDARD_IA", // 31-180 days - $0.0125/GB
      cold: "GLACIER", // 180+ days - $0.004/GB
      archive: "DEEP_ARCHIVE", // 1+ year - $0.00099/GB
    };

    // Video quality presets
    this.qualityPresets = {
      "480p": { width: 854, height: 480, bitrate: "1000k", size: 1 },
      "720p": { width: 1280, height: 720, bitrate: "2500k", size: 2.5 },
      "1080p": { width: 1920, height: 1080, bitrate: "5000k", size: 5 },
      "4k": { width: 3840, height: 2160, bitrate: "15000k", size: 15 },
    };
  }

  /**
   * Upload video with multiple quality versions
   */
  async uploadVideoWithQualities(filePath, fileName, userTier = "basic") {
    try {
      const qualities = this.getQualitiesForTier(userTier);
      const uploadPromises = [];
      const videoData = {
        originalFile: fileName,
        qualities: {},
        totalSize: 0,
        uploadedAt: new Date(),
        storageClass: this.storageClasses.hot,
      };

      // Generate different quality versions
      for (const quality of qualities) {
        const qualityPath = await this.generateQualityVersion(
          filePath,
          quality
        );
        const qualityKey = `videos/${fileName}/${quality}.mp4`;

        const uploadResult = await this.uploadToS3(qualityPath, qualityKey, {
          StorageClass: this.storageClasses.hot,
          Metadata: {
            "original-file": fileName,
            quality: quality,
            "user-tier": userTier,
            "created-at": new Date().toISOString(),
          },
        });

        videoData.qualities[quality] = {
          key: qualityKey,
          url: `https://${this.cloudFrontDomain}/${qualityKey}`,
          size: uploadResult.size,
          storageClass: this.storageClasses.hot,
        };

        videoData.totalSize += uploadResult.size;

        // Clean up temporary quality file
        fs.unlinkSync(qualityPath);
      }

      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(filePath);
      const thumbnailKey = `thumbnails/${fileName}.jpg`;
      await this.uploadToS3(thumbnailPath, thumbnailKey);
      videoData.thumbnail = `https://${this.cloudFrontDomain}/${thumbnailKey}`;
      fs.unlinkSync(thumbnailPath);

      logger.info("Video uploaded with optimizations", {
        fileName,
        qualities: Object.keys(videoData.qualities),
        totalSize: videoData.totalSize,
        userTier,
      });

      return videoData;
    } catch (error) {
      logger.error("Error uploading video with qualities", {
        error: error.message,
        fileName,
      });
      throw error;
    }
  }

  /**
   * Get allowed qualities based on user tier
   */
  getQualitiesForTier(tier) {
    const tierQualities = {
      free: ["480p"],
      basic: ["480p", "720p"],
      pro: ["480p", "720p", "1080p"],
      premium: ["480p", "720p", "1080p", "4k"],
    };
    return tierQualities[tier] || tierQualities.basic;
  }

  /**
   * Generate specific quality version of video
   */
  generateQualityVersion(inputPath, quality) {
    return new Promise((resolve, reject) => {
      const preset = this.qualityPresets[quality];
      const outputPath = path.join(
        path.dirname(inputPath),
        `${path.basename(inputPath, path.extname(inputPath))}_${quality}.mp4`
      );

      ffmpeg(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .size(`${preset.width}x${preset.height}`)
        .videoBitrate(preset.bitrate)
        .audioBitrate("128k")
        .format("mp4")
        .on("end", () => resolve(outputPath))
        .on("error", reject)
        .save(outputPath);
    });
  }

  /**
   * Generate video thumbnail
   */
  generateThumbnail(inputPath) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(
        path.dirname(inputPath),
        `${path.basename(inputPath, path.extname(inputPath))}_thumbnail.jpg`
      );

      ffmpeg(inputPath)
        .screenshots({
          timestamps: ["10%"],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: "1280x720",
        })
        .on("end", () => resolve(outputPath))
        .on("error", reject);
    });
  }

  /**
   * Upload file to S3 with optimizations
   */
  async uploadToS3(filePath, key, options = {}) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: this.getContentType(filePath),
      ...options,
    };

    const result = await s3.upload(uploadParams).promise();
    return { ...result, size: fileSize };
  }

  /**
   * Lifecycle management - move content to appropriate storage class
   */
  async manageContentLifecycle() {
    try {
      const objects = await this.listAllObjects();
      const now = new Date();
      const updates = [];

      for (const obj of objects) {
        const age = Math.floor(
          (now - obj.LastModified) / (1000 * 60 * 60 * 24)
        );
        let targetStorageClass = null;

        if (age > 365) {
          targetStorageClass = this.storageClasses.archive;
        } else if (age > 180) {
          targetStorageClass = this.storageClasses.cold;
        } else if (age > 30) {
          targetStorageClass = this.storageClasses.warm;
        }

        if (targetStorageClass && obj.StorageClass !== targetStorageClass) {
          updates.push({
            key: obj.Key,
            currentClass: obj.StorageClass,
            targetClass: targetStorageClass,
            age,
          });

          await this.changeStorageClass(obj.Key, targetStorageClass);
        }
      }

      logger.info("Content lifecycle management completed", {
        totalObjects: objects.length,
        updates: updates.length,
        summary: updates,
      });

      return updates;
    } catch (error) {
      logger.error("Error in content lifecycle management", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Change storage class of an object
   */
  async changeStorageClass(key, storageClass) {
    await s3
      .copyObject({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${key}`,
        Key: key,
        StorageClass: storageClass,
        MetadataDirective: "COPY",
      })
      .promise();
  }

  /**
   * Get content usage analytics
   */
  async getContentAnalytics(timeframe = 30) {
    try {
      // This would integrate with CloudWatch/analytics service
      const analytics = {
        totalStorage: 0,
        storageByClass: {},
        costEstimate: 0,
        topContent: [],
        unusedContent: [],
      };

      const objects = await this.listAllObjects();

      for (const obj of objects) {
        analytics.totalStorage += obj.Size;

        if (!analytics.storageByClass[obj.StorageClass]) {
          analytics.storageByClass[obj.StorageClass] = { size: 0, count: 0 };
        }
        analytics.storageByClass[obj.StorageClass].size += obj.Size;
        analytics.storageByClass[obj.StorageClass].count++;
      }

      // Calculate cost estimates (simplified)
      const costPerGB = {
        STANDARD: 0.023,
        STANDARD_IA: 0.0125,
        GLACIER: 0.004,
        DEEP_ARCHIVE: 0.00099,
      };

      for (const [storageClass, data] of Object.entries(
        analytics.storageByClass
      )) {
        const sizeInGB = data.size / (1024 * 1024 * 1024);
        analytics.costEstimate += sizeInGB * (costPerGB[storageClass] || 0.023);
      }

      return analytics;
    } catch (error) {
      logger.error("Error getting content analytics", { error: error.message });
      throw error;
    }
  }

  /**
   * Smart caching based on content popularity
   */
  async optimizeCloudFrontCaching(contentId, viewCount, lastViewed) {
    const daysSinceViewed = Math.floor(
      (new Date() - new Date(lastViewed)) / (1000 * 60 * 60 * 24)
    );

    let cacheBehavior = "standard"; // 1 hour

    if (viewCount > 1000 && daysSinceViewed < 7) {
      cacheBehavior = "popular"; // 24 hours
    } else if (viewCount > 100 && daysSinceViewed < 30) {
      cacheBehavior = "trending"; // 12 hours
    } else if (daysSinceViewed > 90) {
      cacheBehavior = "archive"; // No cache
    }

    return cacheBehavior;
  }

  /**
   * Progressive download based on user engagement
   */
  async trackVideoEngagement(videoId, userId, watchTime, totalDuration) {
    const engagementRate = watchTime / totalDuration;

    // If user watches less than 30%, don't preload next segments
    if (engagementRate < 0.3) {
      return { preload: false, reason: "Low engagement" };
    }

    // High engagement - preload next quality or related content
    if (engagementRate > 0.8) {
      return {
        preload: true,
        reason: "High engagement",
        preloadType: "next_quality",
      };
    }

    return {
      preload: true,
      reason: "Standard engagement",
      preloadType: "continue",
    };
  }

  /**
   * Utility functions
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };
    return types[ext] || "application/octet-stream";
  }

  async listAllObjects() {
    const params = { Bucket: this.bucketName };
    const objects = [];

    let continuationToken = null;
    do {
      if (continuationToken) {
        params.ContinuationToken = continuationToken;
      }

      const response = await s3.listObjectsV2(params).promise();
      objects.push(...response.Contents);
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }

  /**
   * Cost monitoring and alerts
   */
  async monitorStorageCosts() {
    const analytics = await this.getContentAnalytics();
    const monthlyBudget = parseFloat(process.env.STORAGE_BUDGET) || 1000;

    if (analytics.costEstimate > monthlyBudget * 0.8) {
      logger.warn("Storage costs approaching budget", {
        currentCost: analytics.costEstimate,
        budget: monthlyBudget,
        percentage: ((analytics.costEstimate / monthlyBudget) * 100).toFixed(1),
      });

      // Implement cost reduction measures
      await this.emergencyCostReduction();
    }

    return {
      currentCost: analytics.costEstimate,
      budget: monthlyBudget,
      status: analytics.costEstimate > monthlyBudget * 0.8 ? "warning" : "ok",
    };
  }

  /**
   * Emergency cost reduction measures
   */
  async emergencyCostReduction() {
    logger.info("Implementing emergency cost reduction measures");

    // Move old content to cheaper storage immediately
    const objects = await this.listAllObjects();
    const now = new Date();

    for (const obj of objects) {
      const age = Math.floor((now - obj.LastModified) / (1000 * 60 * 60 * 24));

      // Aggressive archiving for cost control
      if (age > 60 && obj.StorageClass === "STANDARD") {
        await this.changeStorageClass(obj.Key, this.storageClasses.cold);
      }
    }
  }
}

module.exports = new StorageOptimizer();
