// utils/s3.js
const AWS = require("aws-sdk");

// Check if AWS credentials are properly configured
const hasValidAWSCredentials = () => {
  return (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID !== "your_aws_access_key_id" &&
    process.env.AWS_SECRET_ACCESS_KEY !== "your_aws_secret_access_key" &&
    process.env.AWS_S3_BUCKET !== "your-s3-bucket-name"
  );
};

let s3;
if (hasValidAWSCredentials()) {
  s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
} else {
  console.warn("AWS credentials not configured. Using local file fallback.");
  s3 = null;
}

/**
 * Generate a presigned URL for reading an object or fallback to local URL.
 * @param {string} key The S3 object key (e.g. "videos/course123/filename.mp4")
 * @param {number} expiresIn Seconds until link expires (default 3600 = 1 hour)
 */
function generatePresignedUrl(key, expiresIn = 3600) {
  if (s3 && hasValidAWSCredentials()) {
    return s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn,
    });
  } else {
    // Fallback to local file serving
    const baseUrl =
      process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
    return `${baseUrl}/uploads/${key}`;
  }
}

module.exports = {
  s3,
  generatePresignedUrl,
  hasValidAWSCredentials,
};
