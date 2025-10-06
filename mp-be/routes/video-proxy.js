const express = require("express");
const axios = require("axios");
const router = express.Router();

// Proxy route to serve Bunny CDN videos and bypass hotlink protection
router.get("/bunny/:folder/:filename", async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const bunnyUrl = `https://musicloud-cdn.b-cdn.net/${folder}/${filename}`;

    console.log(`Proxying video request: ${bunnyUrl}`);

    // Make request to Bunny CDN with proper headers
    const response = await axios.get(bunnyUrl, {
      responseType: "stream",
      headers: {
        "User-Agent": "MUSICLOUD-PROXY/1.0",
        Referer: "http://localhost:3000/",
        Origin: "http://localhost:3000",
      },
    });

    // Set appropriate headers for video streaming
    res.set({
      "Content-Type": response.headers["content-type"] || "video/mp4",
      "Content-Length": response.headers["content-length"],
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    });

    // Stream the video data
    response.data.pipe(res);
  } catch (error) {
    console.error("Video proxy error:", error.message);

    if (error.response?.status === 403) {
      res.status(403).json({
        success: false,
        message:
          "Video access forbidden. Check Bunny CDN hotlink protection settings.",
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error loading video.",
      });
    }
  }
});

module.exports = router;
