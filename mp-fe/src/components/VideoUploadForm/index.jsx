// src/components/VideoUploadForm/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  MenuItem,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Grid,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Speed as SpeedIcon,
  MonetizationOn as MoneyIcon,
  VideoLibrary as VideoIcon,
} from "@mui/icons-material";
import CostProtectionAlert from "../CostProtectionAlert";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const VideoUploadForm = () => {
  const token = localStorage.getItem("token");
  const [courses, setCourses] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTutorial, setSelectedTutorial] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploadType, setUploadType] = useState("course"); // 'course' or 'tutorial'
  const [useBunnyCDN, setUseBunnyCDN] = useState(true); // Default to Bunny CDN
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCostProtection, setShowCostProtection] = useState(false);
  const [costProtectionMessage, setCostProtectionMessage] = useState("");

  // Fetch teacher courses and tutorials
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, tutorialsRes] = await Promise.all([
          axios.get(`${API_BASE}/courses/my-teacher-courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/tutorials`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (coursesRes.data.success) {
          setCourses(coursesRes.data.courses);
        }
        if (tutorialsRes.data.success) {
          // Filter tutorials by current user (teacher)
          const userTutorials = tutorialsRes.data.tutorials.filter(
            (tutorial) =>
              tutorial.teacher && tutorial.teacher._id === getUserId()
          );
          setTutorials(userTutorials);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [token]);

  const getUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const handleCourseChange = (e) => setSelectedCourse(e.target.value);
  const handleTutorialChange = (e) => setSelectedTutorial(e.target.value);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleBunnyCDNUpload = async () => {
    const targetId =
      uploadType === "course" ? selectedCourse : selectedTutorial;
    const endpoint =
      uploadType === "course"
        ? `${API_BASE}/courses/${targetId}/bunny-upload-video`
        : `${API_BASE}/tutorials/${targetId}/bunny-upload-video`;

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
        timeout: 300000, // 5 minutes timeout
      });

      if (response.data.success) {
        setMessage(
          `🎉 Video uploaded successfully to Bunny CDN! Processing multiple qualities...`
        );
        setUploadProgress(100);

        // Reset form
        setTimeout(() => {
          setVideoFile(null);
          setUploadProgress(0);
          setUploading(false);
        }, 3000);
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Bunny CDN upload error:", error);
      if (error.response?.status === 429) {
        setCostProtectionMessage(
          "Upload limit reached for your current plan. Upgrade to continue uploading videos."
        );
        setShowCostProtection(true);
        setError("");
      } else if (error.response?.status === 402) {
        setCostProtectionMessage(
          "Bandwidth limit exceeded. Upgrade your plan to continue streaming."
        );
        setShowCostProtection(true);
        setError("");
      } else {
        setError(
          error.response?.data?.message || error.message || "Upload failed"
        );
      }
    }
  };

  const handleAWSUpload = async () => {
    const targetId =
      uploadType === "course" ? selectedCourse : selectedTutorial;
    const fileName = videoFile.name;
    const contentType = videoFile.type || "video/mp4";

    try {
      const payload = { filename: fileName, contentType };
      const presignRes = await axios.post(
        `${API_BASE}/${uploadType === "course" ? "courses" : "tutorials"}/${targetId}/upload-video`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!presignRes.data.success) {
        setError(presignRes.data.message || "Presign request failed.");
        return;
      }

      const { presignedUrl, s3Key } = presignRes.data;
      await axios.put(presignedUrl, videoFile, {
        headers: { "Content-Type": contentType },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      setMessage(`✅ Upload successful to AWS! S3 Key: ${s3Key}`);
      setUploadProgress(100);
    } catch (err) {
      console.error("AWS upload error:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUpload = async () => {
    setMessage("");
    setError("");
    setUploadProgress(0);

    const targetId =
      uploadType === "course" ? selectedCourse : selectedTutorial;
    if (!videoFile || !targetId) {
      setError(`Please select a ${uploadType} and a video file.`);
      return;
    }

    // Check file size (limit to 500MB for demo)
    if (videoFile.size > 500 * 1024 * 1024) {
      setError("File size must be less than 500MB.");
      return;
    }

    setUploading(true);

    try {
      if (useBunnyCDN) {
        await handleBunnyCDNUpload();
      } else {
        await handleAWSUpload();
      }
    } catch (error) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
        <VideoIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Video Upload Center
      </Typography>

      {/* CDN Selection Card */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "white",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                {useBunnyCDN ? (
                  <SpeedIcon sx={{ mr: 1 }} />
                ) : (
                  <CloudUploadIcon sx={{ mr: 1 }} />
                )}
                {useBunnyCDN ? "Bunny CDN (Recommended)" : "AWS S3 (Legacy)"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {useBunnyCDN
                  ? "🚀 93% cheaper • Global CDN • Multi-quality processing • Smart cost protection"
                  : "☁️ Traditional upload • Single quality • Higher costs"}
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={useBunnyCDN}
                  onChange={(e) => setUseBunnyCDN(e.target.checked)}
                  color="default"
                />
              }
              label=""
            />
          </Box>
        </CardContent>
      </Card>

      {/* Upload Type Selection */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Upload Type"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
            variant="outlined"
          >
            <MenuItem value="course">Course Video</MenuItem>
            <MenuItem value="tutorial">Tutorial Video</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label={`Select ${uploadType === "course" ? "Course" : "Tutorial"}`}
            value={uploadType === "course" ? selectedCourse : selectedTutorial}
            onChange={
              uploadType === "course"
                ? handleCourseChange
                : handleTutorialChange
            }
            variant="outlined"
          >
            {(uploadType === "course" ? courses : tutorials).map((item) => (
              <MenuItem key={item._id} value={item._id}>
                {item.title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* File Upload */}
      <Box sx={{ mb: 3 }}>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="video-upload-input"
        />
        <label htmlFor="video-upload-input">
          <Button
            variant="outlined"
            component="span"
            fullWidth
            sx={{
              height: 60,
              borderStyle: "dashed",
              borderWidth: 2,
              "&:hover": { borderStyle: "dashed" },
            }}
          >
            <CloudUploadIcon sx={{ mr: 1 }} />
            {videoFile ? videoFile.name : "Choose Video File"}
          </Button>
        </label>
        {videoFile && (
          <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={`Size: ${formatFileSize(videoFile.size)}`}
              color="primary"
              size="small"
            />
            <Chip
              label={`Type: ${videoFile.type}`}
              color="secondary"
              size="small"
            />
          </Box>
        )}
      </Box>

      {/* Progress Bar */}
      {uploading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Uploading... {uploadProgress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {/* Cost Protection Alert */}
      <CostProtectionAlert
        show={showCostProtection}
        message={costProtectionMessage}
        currentTier="free" // You can get this from user context
        onUpgrade={async (tier) => {
          console.log("Upgrading to:", tier);
          // Implement upgrade logic here
          setShowCostProtection(false);
        }}
        onClose={() => setShowCostProtection(false)}
      />

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {/* Upload Button */}
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={
          uploading || !videoFile || !(selectedCourse || selectedTutorial)
        }
        fullWidth
        size="large"
        sx={{
          height: 50,
          background: useBunnyCDN
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          "&:hover": {
            background: useBunnyCDN
              ? "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)"
              : "linear-gradient(135deg, #ec4899 0%, #ef4444 100%)",
          },
        }}
      >
        {uploading
          ? "Uploading..."
          : `Upload to ${useBunnyCDN ? "Bunny CDN" : "AWS S3"}`}
      </Button>

      {/* Cost Savings Info */}
      {useBunnyCDN && (
        <Card sx={{ mt: 3, bgcolor: "#f0f9ff", border: "1px solid #0ea5e9" }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: "#0369a1", mb: 1 }}>
              <MoneyIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Cost Savings with Bunny CDN
            </Typography>
            <Typography variant="body2" sx={{ color: "#0369a1" }}>
              💰 Save 93% on streaming costs compared to AWS
              <br />
              🌍 Global CDN with 114+ locations
              <br />
              ⚡ Automatic multi-quality processing (480p, 720p, 1080p)
              <br />
              🛡️ Smart cost protection and usage monitoring
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default VideoUploadForm;
