// routes/tutorials.js
// ------------------------------------------------------------
//  PUBLIC    GET /tutorials              – list cards
//  PUBLIC    GET /tutorials/:id          – card details (+signed video if buyer)
//  PRIVATE   GET /tutorials/:id/content  – signed video URL
//  PRIVATE   GET /tutorials/:id/multitracks – array of {name,url}
//  PRIVATE   POST upload-video / upload-thumbnail
//  PRIVATE   CRUD for teachers/admin
// ------------------------------------------------------------
const express = require("express");
const path = require("path");
const router = express.Router();

const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

const Tutorial = require("../models/Tutorial");
const Enrollment = require("../models/Enrollment");

// Bunny CDN Integration
const BunnyCDNService = require("../services/bunnycdn.service");
const { buildBunnySignedUrl } = require("../utils/bunnySignedUrl");

function bunnyPathFrom(urlOrKey) {
  if (!urlOrKey) return null;
  try {
    if (urlOrKey.startsWith("http")) {
      const u = new URL(urlOrKey);
      return u.pathname;
    }
    return urlOrKey.startsWith("/") ? urlOrKey : `/${urlOrKey}`;
  } catch (e) {
    return urlOrKey.startsWith("/") ? urlOrKey : `/${urlOrKey}`;
  }
}

/* ───────── AWS SDK removed - using Bunny CDN only ───────── */

// Check if AWS credentials are properly configured
const hasValidAWSCredentials = () => {
  // AWS removed from project; always return false
  return false;
};

let s3;
s3 = null;

const getBunnyCDNUrl = (key) => {
  if (!key) return null;

  const baseUrl =
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;

  // For existing local files, return local URL
  // For new Bunny CDN files, this would return the CDN URL
  if (key.startsWith("http")) return key;
  return `${baseUrl}/uploads/${key}`;
};

const DEV_UPLOAD_PLACEHOLDER_ENABLED = process.env.NODE_ENV === "development";

// Removed AWS signPut - using Bunny CDN upload routes instead

/* ───────── util: soft-decode bearer if present ───────── */
function tryDecode(req) {
  const hdr = req.header("Authorization") || "";
  if (!hdr.startsWith("Bearer ")) return null;
  const token = hdr.slice(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET); // { id, role, … }
  } catch {
    return null;
  }
}

/* ===========================================================
 * 1. PUBLIC LIST & PUBLIC DETAIL
 * ======================================================= */

/** GET /api/tutorials?limit=4 */
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "0", 10);
    const tutorials = await Tutorial.find({ isPublished: true })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);
    const list = await Promise.all(
      tutorials.map(async (t) => {
        // Update purchase count
        await t.updatePurchaseCount();

        if (t._doc.thumbnail) {
          t._doc.thumbnailUrl = getBunnyCDNUrl(t._doc.thumbnail);
        }

        // Add calculated fields
        t._doc.views = t.purchaseCount;
        t._doc.students = t.purchaseCount;
        t._doc.purchases = t.purchaseCount;
        t._doc.rating = t.averageRating;
        t._doc.reviews = t.reviewCount;

        // Add formatted duration
        if (t.duration > 0) {
          const hours = Math.floor(t.duration / 60);
          const minutes = t.duration % 60;
          t._doc.formattedDuration =
            hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        } else {
          t._doc.formattedDuration = "Duration TBD";
        }

        return t;
      })
    );
    res.json({ success: true, tutorials: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/** GET /api/tutorials/my-student-tutorials */
router.get("/my-student-tutorials", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await Enrollment.find({
      student: userId,
      itemType: "tutorial",
    });
    const tutorialIds = enrollments.map((e) => e.itemId);
    const tutorials = await Tutorial.find({ _id: { $in: tutorialIds } })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    // Attach enrollment data + signed thumbnail
    const list = await Promise.all(
      tutorials.map(async (t) => {
        const enrollment = enrollments.find(
          (e) => e.itemId.toString() === t._id.toString()
        );
        if (t._doc.thumbnail) {
          try {
            t._doc.thumbnailUrl = getBunnyCDNUrl(t._doc.thumbnail);
          } catch (err) {
            t._doc.thumbnailUrl = `/uploads/${t._doc.thumbnail}`;
          }
        }
        return {
          ...t.toObject(),
          enrolledAt: enrollment?.enrolledAt,
          enrolled: true,
          purchased: true,
        };
      })
    );

    res.json({ success: true, tutorials: list });
  } catch (err) {
    console.error("Get my student tutorials error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/** GET /api/tutorials/:id   (token optional) */
router.get("/:id", async (req, res) => {
  try {
    const t = await Tutorial.findById(req.params.id).populate(
      "teacher",
      "name email"
    );
    if (!t)
      return res.status(404).json({ success: false, message: "Not found" });

    // Update purchase count
    await t.updatePurchaseCount();

    if (t._doc.thumbnail) {
      try {
        t._doc.thumbnailUrl = getBunnyCDNUrl(t._doc.thumbnail);
      } catch (err) {
        console.warn("S3 thumbnail generation failed:", err.message);
        t._doc.thumbnailUrl = `/uploads/${t._doc.thumbnail}`;
      }
    }

    // Add calculated fields
    t._doc.views = t.purchaseCount;
    t._doc.students = t.purchaseCount;
    t._doc.purchases = t.purchaseCount;
    t._doc.rating = t.averageRating;
    t._doc.reviews = t.reviewCount;

    // Add formatted duration
    if (t.duration > 0) {
      const hours = Math.floor(t.duration / 60);
      const minutes = t.duration % 60;
      t._doc.formattedDuration =
        hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    } else {
      t._doc.formattedDuration = "Duration TBD";
    }

    /* attach signed video if caller already bought it */
    const user = tryDecode(req);
    const owns =
      user &&
      (user.role === "admin" ||
        (await Enrollment.exists({
          student: user.id,
          itemType: "tutorial",
          itemId: t._id,
        })));

    // Add enrollment status to the response
    t._doc.enrolled = !!owns;
    t._doc.purchased = !!owns;

    // Determine if any video source exists
    const hasVideoSource = Boolean(t.videoKey || t.mainVideoUrl || t.videoUrl);
    t._doc.hasVideo = hasVideoSource;

    // If there is no actual video, do not show a concrete duration even if stale
    if (!hasVideoSource) {
      t._doc.formattedDuration = "Duration TBD";
    }

    if (owns) {
      const baseUrl =
        process.env.BUNNY_PULL_ZONE_URL || "https://musicloud-cdn.b-cdn.net";
      // Try to get signed URL from videoKey first, then fallback to mainVideoUrl or videoUrl
      if (t.videoKey) {
        try {
          const path = bunnyPathFrom(t.videoKey);
          t._doc.videoSignedUrl = buildBunnySignedUrl(baseUrl, path);
        } catch (err) {
          return res.status(503).json({
            success: false,
            message:
              "Video signing not configured. Set BUNNY_URL_TOKEN_KEY and restart backend.",
          });
        }
      } else if (t.mainVideoUrl) {
        const path = bunnyPathFrom(t.mainVideoUrl);
        try {
          t._doc.videoSignedUrl = buildBunnySignedUrl(baseUrl, path);
        } catch {
          return res.status(503).json({
            success: false,
            message:
              "Video signing not configured. Set BUNNY_URL_TOKEN_KEY and restart backend.",
          });
        }
      } else if (t.videoUrl) {
        const path = bunnyPathFrom(t.videoUrl);
        try {
          t._doc.videoSignedUrl = buildBunnySignedUrl(baseUrl, path);
        } catch {
          return res.status(503).json({
            success: false,
            message:
              "Video signing not configured. Set BUNNY_URL_TOKEN_KEY and restart backend.",
          });
        }
      }
    }

    res.json({ success: true, tutorial: t });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===========================================================
 * 2. PROTECTED VIDEO CONTENT
 * ======================================================= */

router.get("/:id/content", auth, async (req, res) => {
  try {
    const t = await Tutorial.findById(req.params.id);
    if (!t)
      return res.status(404).json({ success: false, message: "Not found" });

    const isOwner =
      req.user.role === "teacher" && t.teacher.toString() === req.user.id;

    const enrolled = await Enrollment.exists({
      student: req.user.id,
      itemType: "tutorial",
      itemId: t._id,
    });

    if (req.user.role !== "admin" && !isOwner && !enrolled)
      return res
        .status(403)
        .json({ success: false, message: "Purchase the tutorial first." });

    // Check if video exists in any of the video fields
    if (!t.videoKey && !t.mainVideoUrl && !t.videoUrl) {
      return res.status(404).json({ success: false, message: "Video missing" });
    }

    const baseUrl =
      process.env.BUNNY_PULL_ZONE_URL || "https://musicloud-cdn.b-cdn.net";
    let videoUrl;
    if (t.videoKey) {
      const p = bunnyPathFrom(t.videoKey);
      videoUrl = buildBunnySignedUrl(baseUrl, p);
    } else if (t.mainVideoUrl) {
      const p = bunnyPathFrom(t.mainVideoUrl);
      videoUrl = buildBunnySignedUrl(baseUrl, p);
    } else {
      const p = bunnyPathFrom(t.videoUrl);
      videoUrl = buildBunnySignedUrl(baseUrl, p);
    }

    res.json({
      success: true,
      videoUrl,
      videoLinks: [videoUrl],
      bunnyVideoUrl: videoUrl,
      videoProvider: "bunny",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===========================================================
 * 3.  NEW  · PROTECTED MULTITRACK LIST
 * ======================================================= */
/** GET /api/tutorials/:id/multitracks */
router.get("/:id/multitracks", auth, async (req, res) => {
  try {
    const t = await Tutorial.findById(req.params.id);
    if (!t)
      return res.status(404).json({ success: false, message: "Not found" });

    // Access control: owner/admin/enrolled
    const isOwner =
      req.user.role === "teacher" && t.teacher.toString() === req.user.id;
    const enrolled = await Enrollment.exists({
      student: req.user.id,
      itemType: "tutorial",
      itemId: t._id,
    });
    if (req.user.role !== "admin" && !isOwner && !enrolled) {
      return res
        .status(403)
        .json({ success: false, message: "Purchase the tutorial first." });
    }

    const baseUrl =
      process.env.BUNNY_PULL_ZONE_URL || "https://musicloud-cdn.b-cdn.net";
    const tracks = (t.multitracks || []).map((trk) => {
      const originalUrl = trk.url || "";
      let signedUrl = originalUrl;
      try {
        const p = bunnyPathFrom(originalUrl);
        signedUrl = buildBunnySignedUrl(baseUrl, p);
      } catch {}
      return { ...(trk.toObject?.() || trk), url: signedUrl };
    });

    res.json({ success: true, tracks });
  } catch (err) {
    console.error("Error loading multitracks:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===========================================================
 * 4. CRUD for teachers / admin
 * ======================================================= */

router.post("/", auth, role(["teacher", "admin"]), async (req, res) => {
  try {
    const { title, description, price, thumbnail, videoKey } = req.body;
    const tut = await Tutorial.create({
      title,
      description,
      price,
      thumbnail,
      videoKey,
      teacher: req.user.id,
    });
    res.json({ success: true, tutorial: tut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const tut = await Tutorial.findById(req.params.id);
    if (!tut)
      return res.status(404).json({ success: false, message: "Not found" });

    const isOwner =
      tut.teacher.toString() === req.user.id || req.user.role === "admin";
    if (!isOwner)
      return res.status(403).json({ success: false, message: "Forbidden" });

    ["title", "description", "price", "thumbnail", "videoKey"].forEach((f) => {
      if (req.body[f] !== undefined) tut[f] = req.body[f];
    });
    await tut.save();
    res.json({ success: true, tutorial: tut });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const tut = await Tutorial.findById(req.params.id);
    if (!tut)
      return res.status(404).json({ success: false, message: "Not found" });

    const isOwner =
      tut.teacher.toString() === req.user.id || req.user.role === "admin";
    if (!isOwner)
      return res.status(403).json({ success: false, message: "Forbidden" });

    await tut.remove();
    res.json({ success: true, message: "Tutorial deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===========================================================
 * 5. PRESIGNED UPLOAD HELPERS (REMOVED - using Bunny routes)
 * ======================================================= */

const {
  uploadVideo,
  uploadVideoToBunny,
  uploadThumbnail,
  uploadThumbnailToBunny,
  uploadMultitracksArray,
  uploadMultitracksToBunny,
} = require("../middlewares/uploadVideoBunny");

// Thumbnail upload endpoint to match frontend
router.post(
  "/upload-thumbnail",
  auth,
  role(["teacher", "admin"]),
  uploadThumbnail,
  uploadThumbnailToBunny,
  async (req, res) => {
    try {
      const url = req?.bunnyThumbnail?.thumbnailUrl;
      if (!url) {
        return res
          .status(500)
          .json({ success: false, message: "Thumbnail upload failed" });
      }
      return res.json({ success: true, url });
    } catch (err) {
      console.error("Tutorial thumbnail upload error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error during thumbnail upload",
      });
    }
  }
);

// Create tutorial all-in-one (title, desc, price, video)
router.post(
  "/create-with-video",
  auth,
  role(["teacher", "admin"]),
  uploadVideo,
  uploadVideoToBunny,
  async (req, res) => {
    try {
      if (!req.bunnyUpload?.success) {
        return res
          .status(400)
          .json({ success: false, message: "Video upload failed" });
      }
      const {
        title,
        description,
        price = 0,
        category = "Music",
        difficulty = "beginner",
        thumbnailUrl = "",
      } = req.body;

      const allowedLevels = ["beginner", "intermediate", "advanced"];
      const level = String(difficulty || "beginner").toLowerCase();
      const safeLevel = allowedLevels.includes(level) ? level : "beginner";

      const t = await Tutorial.create({
        title,
        description,
        price: parseFloat(price) || 0,
        category,
        level: safeLevel,
        teacher: req.user.id,
        bunnyVideoUrl: req.bunnyUpload.videoUrl,
        bunnyThumbnailUrl: thumbnailUrl || req.bunnyUpload.thumbnailUrl || "",
        bunnyVideoQualities: {},
        duration: req.bunnyUpload.duration || 0,
        videoProcessed: true,
        videoProvider: "bunny",
        videoKey: req.bunnyUpload.videoKey,
        isPublished: false,
      });
      return res.json({ success: true, tutorial: t });
    } catch (err) {
      console.error("Create tutorial error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to create tutorial" });
    }
  }
);

// Dev-only upload placeholder to accept a file and place it under /uploads for quick testing
router.post("/upload-placeholder", async (req, res) => {
  try {
    if (!DEV_UPLOAD_PLACEHOLDER_ENABLED) {
      return res
        .status(400)
        .json({ success: false, message: "Upload placeholder disabled" });
    }

    const multer = require("multer");
    const path = require("path");
    const fs = require("fs");

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const storage = multer.diskStorage({
      destination: function (_req, _file, cb) {
        cb(null, uploadDir);
      },
      filename: function (_req, file, cb) {
        const safe = `${Date.now()}-${file.originalname}`;
        cb(null, safe);
      },
    });

    const upload = multer({ storage }).single("video");

    upload(req, res, function (err) {
      if (err) {
        console.error("Upload placeholder error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Upload failed" });
      }
      const filename = req.file?.filename;
      if (!filename) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      return res.json({ success: true, url: `/uploads/${filename}` });
    });
  } catch (err) {
    console.error("Upload placeholder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===== NEW: Manual Duration Calculation ===== */
router.post(
  "/:id/calculate-duration",
  auth,
  role(["teacher", "admin"]),
  async (req, res) => {
    try {
      const tutorial = await Tutorial.findById(req.params.id);
      if (!tutorial) {
        return res
          .status(404)
          .json({ success: false, message: "Tutorial not found" });
      }

      // Check permissions
      if (
        req.user.role !== "admin" &&
        tutorial.teacher.toString() !== req.user.id
      ) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      if (!tutorial.videoKey) {
        return res.status(400).json({
          success: false,
          message: "No video uploaded for this tutorial",
        });
      }

      // Calculate duration
      await tutorial.calculateDuration(s3);

      res.json({
        success: true,
        message: "Duration calculated successfully",
        duration: tutorial.duration,
        formattedDuration:
          tutorial.duration > 0
            ? tutorial.duration >= 60
              ? `${Math.floor(tutorial.duration / 60)}h ${Math.round(
                  tutorial.duration % 60
                )}m`
              : `${Math.round(tutorial.duration)}m`
            : "Duration TBD",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* ═══════════════════════════════════════════════════════════════
 * 6. BUNNY CDN UPLOAD ROUTES (NEW - 93% CHEAPER!)
 * ═══════════════════════════════════════════════════════════════ */

// Test route (must come before /:id routes)
router.get("/test-bunny", (req, res) => {
  res.json({
    success: true,
    message: "Bunny CDN routes are loaded!",
    timestamp: new Date().toISOString(),
  });
});

// Upload video to Bunny CDN with automatic multi-quality processing

router.post(
  "/:id/bunny-upload-video",
  auth,
  role(["teacher", "admin"]),
  uploadVideo,
  uploadVideoToBunny,
  async (req, res) => {
    try {
      const { id: tutorialId } = req.params;

      const tutorial = await Tutorial.findById(tutorialId);
      if (!tutorial) {
        return res
          .status(404)
          .json({ success: false, message: "Tutorial not found" });
      }

      // Check if user is the teacher of this tutorial
      if (
        tutorial.teacher.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to upload to this tutorial",
        });
      }

      const upload = req.bunnyUpload;
      if (!upload?.success) {
        return res
          .status(500)
          .json({ success: false, message: "Video upload failed" });
      }

      // Persist Bunny CDN video data
      tutorial.bunnyVideoUrl = upload.videoUrl;
      tutorial.bunnyThumbnailUrl =
        upload.thumbnailUrl || tutorial.bunnyThumbnailUrl;
      tutorial.bunnyVideoQualities = {};
      tutorial.duration = upload.duration || tutorial.duration;
      tutorial.videoProcessed = true;
      tutorial.videoProvider = "bunny";
      tutorial.videoKey = upload.videoKey;
      await tutorial.save();

      res.json({
        success: true,
        message: "Video uploaded to Bunny CDN successfully!",
        tutorialId: tutorial._id,
        videoUrl: upload.videoUrl,
        thumbnailUrl: upload.thumbnailUrl,
      });
    } catch (err) {
      console.error("Bunny CDN video upload error:", err);
      res.status(500).json({
        success: false,
        message: "Server error during Bunny CDN video upload",
      });
    }
  }
);

// Upload thumbnail to Bunny CDN
router.post(
  "/bunny-upload-thumbnail",
  auth,
  role(["teacher", "admin"]),
  // uploadThumbnail, // Temporarily commented
  async (req, res) => {
    // Temporary simple response for testing
    res.json({
      success: true,
      message: "Bunny CDN thumbnail upload route is working! (Test mode)",
      timestamp: new Date().toISOString(),
      note: "This is a test response. Full implementation coming soon.",
    });
  }
);

// Upload multitracks to Bunny and persist on tutorial
router.post(
  "/:id/multitracks",
  auth,
  role(["teacher", "admin"]),
  uploadMultitracksArray,
  uploadMultitracksToBunny,
  async (req, res) => {
    try {
      const t = await Tutorial.findById(req.params.id);
      if (!t)
        return res.status(404).json({ success: false, message: "Not found" });
      if (t.teacher.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      const tracks = req.bunnyMultitracks || [];
      t.multitracks = [...(t.multitracks || []), ...tracks];
      await t.save();
      return res.json({ success: true, tracks: t.multitracks });
    } catch (err) {
      console.error("Save multitracks error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to save multitracks" });
    }
  }
);

// Get video streaming URL with cost protection
router.get("/:id/bunny-stream", auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res
        .status(404)
        .json({ success: false, message: "Tutorial not found" });
    }

    // Check if user has access (purchased or enrolled)
    const hasAccess = await checkUserAccess(req.user.id, tutorial._id);
    if (!hasAccess && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Purchase required to access video content",
      });
    }

    // Check if tutorial has Bunny CDN video
    if (!tutorial.bunnyVideoUrl && !tutorial.bunnyVideoQualities) {
      return res.status(404).json({
        success: false,
        message:
          "Video not available on Bunny CDN. Please re-upload the video.",
      });
    }

    const quality = req.query.quality || "auto";
    const userTier = req.user.subscriptionTier || "free";

    // Get streaming URL based on available qualities
    let streamingUrl;
    let actualQuality = quality;

    if (quality === "auto") {
      // Get best available quality
      const availableQualities = Object.keys(
        tutorial.bunnyVideoQualities || {}
      );
      if (availableQualities.length > 0) {
        // Use highest quality available
        actualQuality = availableQualities.includes("1080p")
          ? "1080p"
          : availableQualities.includes("720p")
          ? "720p"
          : availableQualities.includes("480p")
          ? "480p"
          : availableQualities[0];
        streamingUrl = tutorial.bunnyVideoQualities[actualQuality]?.url;
      } else {
        // Fallback to original video
        streamingUrl = tutorial.bunnyVideoUrl;
        actualQuality = "original";
      }
    } else {
      // Use requested quality if available
      if (
        tutorial.bunnyVideoQualities &&
        tutorial.bunnyVideoQualities[quality]
      ) {
        streamingUrl = tutorial.bunnyVideoQualities[quality].url;
      } else {
        // Fallback to original or best available
        streamingUrl = tutorial.bunnyVideoUrl;
        actualQuality = "original";
      }
    }

    if (!streamingUrl) {
      return res.status(404).json({
        success: false,
        message: "Video streaming URL not available",
      });
    }

    res.json({
      success: true,
      data: {
        streamingUrl: streamingUrl,
        quality: actualQuality,
        maxQuality: "1080p", // Maximum supported quality
        thumbnailUrl: tutorial.bunnyThumbnailUrl || tutorial.thumbnailUrl,
        duration: tutorial.duration,
        availableQualities: Object.keys(tutorial.bunnyVideoQualities || {}),
      },
    });
  } catch (error) {
    console.error("Bunny streaming error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting streaming URL",
      error: error.message,
    });
  }
});

// Helper function to check user access
async function checkUserAccess(userId, tutorialId) {
  // Check if user is enrolled as a student
  const enrollment = await Enrollment.findOne({
    student: userId,
    itemType: "tutorial",
    itemId: tutorialId,
  });

  if (enrollment) {
    return true;
  }

  // Check if user is the teacher who owns this tutorial
  const tutorial = await Tutorial.findById(tutorialId);
  if (tutorial && tutorial.teacher.toString() === userId) {
    return true;
  }

  return false;
}

module.exports = router;
