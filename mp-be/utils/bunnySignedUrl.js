const crypto = require("crypto");

/**
 * buildBunnySignedUrl
 * @param {string} baseUrl - e.g., https://musicloud-cdn.b-cdn.net
 * @param {string} path - e.g., /videos/file.mp4 OR videos/file.mp4
 * @param {number} ttlSeconds - lifetime for the token
 * @returns {string} signed URL
 */
function buildBunnySignedUrl(baseUrl, path, ttlSeconds = 900) {
  if (!process.env.BUNNY_URL_TOKEN_KEY) {
    throw new Error("BUNNY_URL_TOKEN_KEY is not set");
  }

  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const tokenKey = process.env.BUNNY_URL_TOKEN_KEY;

  // Hash is tokenKey + path + expires
  const dataToHash = `${tokenKey}${normalizedPath}${expires}`;
  const md5 = crypto.createHash("md5").update(dataToHash).digest();
  const token = md5
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const url = `${normalizedBase}${normalizedPath}?token=${token}&expires=${expires}`;
  return url;
}

module.exports = { buildBunnySignedUrl };
