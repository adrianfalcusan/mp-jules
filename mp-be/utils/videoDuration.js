// utils/videoDuration.js - Extract video duration from files
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require("util");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

/**
 * Extract duration from a local video file
 * @param {string} filePath - Path to the video file
 * @returns {Promise<number>} - Duration in minutes
 */
async function getLocalVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error("Error extracting video duration:", err);
        return reject(err);
      }

      const duration = metadata.format.duration;
      if (!duration) {
        return reject(new Error("Could not extract duration from video"));
      }

      // Convert seconds to minutes
      const durationMinutes = Math.round((duration / 60) * 100) / 100; // 2 decimal places
      resolve(durationMinutes);
    });
  });
}

/**
 * Extract duration from an S3 video file using signed URL
 * @param {Object} s3Client - AWS S3 client instance
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @returns {Promise<number>} - Duration in minutes
 */
async function getS3VideoDuration(s3Client, bucket, key) {
  try {
    // Generate a temporary signed URL for the video
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      { expiresIn: 3600 } // 1 hour
    );

    // Use the signed URL with ffprobe
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(signedUrl, (err, metadata) => {
        if (err) {
          console.error("Error extracting S3 video duration:", err);
          return reject(err);
        }

        const duration = metadata.format.duration;
        if (!duration) {
          return reject(new Error("Could not extract duration from S3 video"));
        }

        // Convert seconds to minutes
        const durationMinutes = Math.round((duration / 60) * 100) / 100; // 2 decimal places
        resolve(durationMinutes);
      });
    });
  } catch (error) {
    console.error("Error getting S3 video duration:", error);
    throw error;
  }
}

/**
 * Extract duration from video file (auto-detects local vs S3)
 * @param {string|Object} source - File path or {s3Client, bucket, key}
 * @returns {Promise<number>} - Duration in minutes
 */
async function getVideoDuration(source) {
  if (typeof source === "string") {
    // Local file path
    return getLocalVideoDuration(source);
  } else if (source && source.s3Client && source.bucket && source.key) {
    // S3 object
    return getS3VideoDuration(source.s3Client, source.bucket, source.key);
  } else {
    throw new Error(
      "Invalid source: must be file path or {s3Client, bucket, key}"
    );
  }
}

/**
 * Format duration from minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration (e.g., "3m", "1h 30m")
 */
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) {
    return "Duration TBD";
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

module.exports = {
  getLocalVideoDuration,
  getS3VideoDuration,
  getVideoDuration,
  formatDuration,
};
