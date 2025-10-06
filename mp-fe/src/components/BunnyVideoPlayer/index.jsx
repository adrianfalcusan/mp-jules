// src/components/BunnyVideoPlayer/index.jsx
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Menu,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  Speed,
  Hd,
} from "@mui/icons-material";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const BunnyVideoPlayer = ({
  tutorialId,
  courseId,
  onProgress,
  autoPlay = false,
  showControls = true,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [availableQualities, setAvailableQualities] = useState(["original"]);
  const [currentQuality, setCurrentQuality] = useState("original");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settingsAnchor, setSettingsAnchor] = useState(null);

  const [costSavings, setCostSavings] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadVideoData();
  }, [tutorialId, courseId]);

  const loadVideoData = async () => {
    setLoading(true);
    setError("");

    try {
      const id = tutorialId || courseId;
      const type = tutorialId ? "tutorials" : "courses";

      // Always fetch signed URL from content endpoint
      const response = await axios.get(`${API_BASE}/${type}/${id}/content`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const links = response.data?.videoLinks || [];
      if (links.length > 0) {
        setVideoUrl(links[0]);
        setAvailableQualities(["original"]);
        setCurrentQuality("original");

        setCostSavings({
          provider: "Bunny CDN",
          savings: "secured",
          features: ["Signed URLs"],
        });
      } else {
        throw new Error("No video URL available");
      }
    } catch (error) {
      console.error("Error loading video:", error);
      setError(error.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  const changeQuality = async (quality) => {
    // For now, single quality signed MP4
    setCurrentQuality(quality);
    setSettingsAnchor(null);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);

      if (onProgress) {
        onProgress({
          currentTime: current,
          duration: total,
          progress: total > 0 ? (current / total) * 100 : 0,
        });
      }
    }
  };

  const handleSeek = (event, newValue) => {
    if (videoRef.current) {
      const seekTime = (newValue / 100) * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const volumeValue = newValue / 100;
    setVolume(volumeValue);
    if (videoRef.current) {
      videoRef.current.volume = volumeValue;
    }
    setIsMuted(volumeValue === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getQualityLabel = (quality) => {
    switch (quality) {
      case "original":
        return "Original";
      default:
        return quality;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
          bgcolor: "#000",
          borderRadius: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#000",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Cost Savings Badge */}
      {costSavings && (
        <Chip
          icon={<Speed />}
          label={`${costSavings.provider} • ${costSavings.savings}`}
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: "rgba(25, 118, 210, 0.9)",
            color: "white",
          }}
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay={autoPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
        crossOrigin="anonymous"
        controls={!showControls}
      />

      {/* Custom Controls */}
      {showControls && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
            color: "white",
            p: 1,
          }}
        >
          {/* Progress Bar */}
          <Slider
            value={duration > 0 ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            sx={{
              color: "#1976d2",
              height: 4,
              mb: 1,
              "& .MuiSlider-thumb": {
                width: 12,
                height: 12,
              },
            }}
          />

          {/* Control Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Play/Pause */}
              <IconButton onClick={togglePlay} sx={{ color: "white" }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              {/* Volume */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: 120,
                }}
              >
                <IconButton onClick={toggleMute} sx={{ color: "white" }}>
                  {isMuted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
                </IconButton>
                <Slider
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  sx={{
                    color: "white",
                    width: 60,
                    "& .MuiSlider-thumb": { width: 12, height: 12 },
                  }}
                />
              </Box>

              {/* Time Display */}
              <Typography variant="caption" sx={{ minWidth: 80 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Quality Selector (single for now) */}
              {availableQualities.length > 1 && (
                <>
                  <Tooltip title="Video Quality">
                    <IconButton
                      onClick={(e) => setSettingsAnchor(e.currentTarget)}
                      sx={{ color: "white" }}
                    >
                      <Hd />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={settingsAnchor}
                    open={Boolean(settingsAnchor)}
                    onClose={() => setSettingsAnchor(null)}
                  >
                    {availableQualities.map((quality) => (
                      <MenuItem
                        key={quality}
                        onClick={() => changeQuality(quality)}
                        selected={quality === currentQuality}
                      >
                        {getQualityLabel(quality)}
                        {quality === currentQuality && " ✓"}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Provider Badge */}
              <Chip
                label={"Bunny CDN"}
                size="small"
                color="primary"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />

              {/* Fullscreen */}
              <IconButton onClick={toggleFullscreen} sx={{ color: "white" }}>
                <Fullscreen />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        >
          <CircularProgress sx={{ color: "white" }} />
        </Box>
      )}
    </Box>
  );
};

BunnyVideoPlayer.propTypes = {
  tutorialId: PropTypes.string,
  courseId: PropTypes.string,
  onProgress: PropTypes.func,
  autoPlay: PropTypes.bool,
  showControls: PropTypes.bool,
};

export default BunnyVideoPlayer;
