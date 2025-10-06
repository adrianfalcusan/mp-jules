// config/bunny.js
const logger = require("../utils/logger");

class BunnyCDNConfig {
  constructor() {
    this.apiKey = process.env.BUNNY_API_KEY;
    this.storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
    this.storagePassword = process.env.BUNNY_STORAGE_PASSWORD;
    this.pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL; // e.g., https://musicloud.b-cdn.net
    this.storageApiUrl =
      process.env.BUNNY_STORAGE_API_URL || "https://storage.bunnycdn.com";

    // Storage regions
    this.storageRegions = {
      de: "https://storage.bunnycdn.com", // Germany (Falkenstein)
      ny: "https://ny.storage.bunnycdn.com", // New York
      la: "https://la.storage.bunnycdn.com", // Los Angeles
      sg: "https://sg.storage.bunnycdn.com", // Singapore
      syd: "https://syd.storage.bunnycdn.com", // Sydney
      uk: "https://uk.storage.bunnycdn.com", // London
    };

    this.region = process.env.BUNNY_REGION || "de"; // Default to Germany
    this.baseUrl = this.storageRegions[this.region] || this.storageApiUrl;

    // Video processing settings
    this.videoSettings = {
      qualities: ["480p", "720p", "1080p", "4k"],
      thumbnailSize: "1280x720",
      thumbnailPosition: "10%", // Generate thumbnail at 10% of video duration
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB max file size
      allowedFormats: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
      defaultQuality: "720p",
    };

    // Cost protection settings
    this.costLimits = {
      maxMonthlyCost: parseFloat(process.env.BUNNY_MAX_MONTHLY_COST) || 1000,
      alertThreshold: 0.8, // Alert at 80% of budget
      emergencyThreshold: 0.95, // Emergency mode at 95% of budget
    };

    // Don't validate on construction - only when actually used
    this.configured = this.validateConfig();
  }

  validateConfig() {
    const required = [
      "BUNNY_API_KEY",
      "BUNNY_STORAGE_ZONE_NAME",
      "BUNNY_STORAGE_PASSWORD",
      "BUNNY_PULL_ZONE_URL",
    ];

    const missing = required.filter((key) => {
      const value = process.env[key];
      return !value || value.startsWith("CHANGE_ME_");
    });

    if (missing.length > 0) {
      logger.warn("Bunny CDN configuration incomplete:", {
        missing,
        note: "Update .env file with real credentials to use Bunny CDN",
      });
      return false;
    }

    logger.info("Bunny CDN configuration loaded", {
      region: this.region,
      storageZone: this.storageZoneName,
      pullZoneUrl: this.pullZoneUrl,
      baseUrl: this.baseUrl,
    });
    return true;
  }

  isConfigured() {
    return this.validateConfig();
  }

  getStorageUrl(path = "") {
    return `${this.baseUrl}/${this.storageZoneName}/${path}`;
  }

  getCDNUrl(path = "") {
    return `${this.pullZoneUrl}/${path}`;
  }

  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "MUSICLOUD/1.0",
    };

    if (includeAuth) {
      headers["AccessKey"] = this.storagePassword;
    }

    return headers;
  }

  getUploadHeaders(contentType = "application/octet-stream") {
    return {
      "Content-Type": contentType,
      AccessKey: this.storagePassword,
      "User-Agent": "MUSICLOUD/1.0",
    };
  }

  // Quality presets for video transcoding
  getQualityPresets() {
    return {
      "480p": {
        width: 854,
        height: 480,
        bitrate: "1000k",
        audioBitrate: "128k",
        fps: 30,
        estimatedSizeMB: 1, // Per minute of video
      },
      "720p": {
        width: 1280,
        height: 720,
        bitrate: "2500k",
        audioBitrate: "128k",
        fps: 30,
        estimatedSizeMB: 2.5,
      },
      "1080p": {
        width: 1920,
        height: 1080,
        bitrate: "5000k",
        audioBitrate: "192k",
        fps: 30,
        estimatedSizeMB: 5,
      },
      "4k": {
        width: 3840,
        height: 2160,
        bitrate: "15000k",
        audioBitrate: "256k",
        fps: 30,
        estimatedSizeMB: 15,
      },
    };
  }

  // Get allowed qualities based on user subscription
  getAllowedQualities(userTier) {
    const tierQualities = {
      free: ["480p"],
      basic: ["480p", "720p"],
      pro: ["480p", "720p", "1080p"],
      premium: ["480p", "720p", "1080p", "4k"],
    };

    return tierQualities[userTier] || tierQualities.free;
  }

  // Calculate estimated costs
  calculateCosts(fileSizeGB, estimatedViews = 100) {
    const storageCost = fileSizeGB * 0.01; // $0.01 per GB storage
    const bandwidthCost = fileSizeGB * estimatedViews * 0.01; // $0.01 per GB bandwidth

    return {
      monthly: {
        storage: storageCost,
        bandwidth: bandwidthCost,
        total: storageCost + bandwidthCost,
      },
      perView: bandwidthCost / estimatedViews,
    };
  }

  // Get optimal region based on user location (future enhancement)
  getOptimalRegion(userCountry = "US") {
    const regionMapping = {
      US: "ny", // New York for US users
      CA: "ny", // New York for Canadian users
      DE: "de", // Germany for European users
      GB: "uk", // London for UK users
      FR: "uk", // London for French users
      SG: "sg", // Singapore for Asian users
      AU: "syd", // Sydney for Australian users
      JP: "sg", // Singapore for Japanese users
    };

    return regionMapping[userCountry] || "de"; // Default to Germany
  }
}

module.exports = BunnyCDNConfig;
