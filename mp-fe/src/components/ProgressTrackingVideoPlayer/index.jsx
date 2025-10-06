// src/components/ProgressTrackingVideoPlayer/index.jsx
import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useProgressTracking } from "../../hooks/useProgressTracking";
// no UI imports needed

const ProgressTrackingVideoPlayer = ({
  src,
  contentType,
  contentId,
  onProgressUpdate,
  className = "",
  ...props
}) => {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const lastPositionUpdateRef = useRef(0);
  const didSeekInitialRef = useRef(false);
  const isProgrammaticSeekRef = useRef(false);

  const {
    progress,
    startSession,
    stopSession,
    startVideoWatching,
    stopVideoWatching,
    updateVideoPosition,
    completeContent,
    loadProgress,
    getCurrentVideoWatchTime,
  } = useProgressTracking(contentType, contentId);

  // Initialize progress tracking
  useEffect(() => {
    if (contentType && contentId) {
      loadProgress();
      startSession();
    }

    return () => {
      stopSession();
    };
    // eslint-disable-next-line
  }, [contentType, contentId]); // Remove function dependencies to prevent infinite loop

  // Auto-seek to saved position (slightly earlier for context) once metadata is loaded
  useEffect(() => {
    if (videoRef.current && progress.lastPosition > 0 && duration > 0) {
      if (!didSeekInitialRef.current) {
        const seekTo = Math.max(progress.lastPosition - 2, 0);
        isProgrammaticSeekRef.current = true;
        videoRef.current.currentTime = seekTo;
        didSeekInitialRef.current = true;
        // clear the programmatic flag shortly after the seek is applied
        setTimeout(() => {
          isProgrammaticSeekRef.current = false;
        }, 100);
      }
    }
  }, [progress.lastPosition, duration]);

  // Handle video play event
  const handlePlay = () => {
    startVideoWatching(); // Start tracking video watch time
  };

  // Handle video pause event
  const handlePause = () => {
    stopVideoWatching(); // Stop tracking video watch time
  };

  // Handle video end event – only here we mark completion (100%)
  const handleEnded = () => {
    stopVideoWatching();
    completeContent();
    if (onProgressUpdate) {
      onProgressUpdate({
        currentTime: duration,
        duration,
        progress: 100,
        watchTime: getCurrentVideoWatchTime(),
      });
    }
  };

  // Handle time update – persist position only (no % update)
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;

      // Persist last position every 30 seconds to reduce API calls
      if (current - lastPositionUpdateRef.current >= 30) {
        updateVideoPosition(current, duration);
        lastPositionUpdateRef.current = current;
      }

      if (onProgressUpdate) {
        onProgressUpdate({
          currentTime: current,
          duration,
          progress: progress.progressPercentage,
          watchTime: getCurrentVideoWatchTime(),
        });
      }
    }
  };

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Handle video seeking – persist new position
  const handleSeeking = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      // Avoid persisting during our initial programmatic seek
      if (!isProgrammaticSeekRef.current) {
        updateVideoPosition(current, duration);
      }
    }
  };

  // Check if src is valid
  if (!src) {
    console.error("ProgressTrackingVideoPlayer: No video source provided");
    return (
      <div className={`video-player-container ${className}`}>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "#f5f5f5",
            borderRadius: "8px",
            ...props.style,
          }}
        >
          <p>No video source available</p>
          {src && src.includes(".mov") && (
            <p style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "10px" }}>
              ⚠️ QuickTime (.mov) format detected. For better compatibility, please use MP4 format.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`video-player-container ${className}`}>
      <video
        ref={videoRef}
        src={src}
        controls
        preload="metadata"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          ...props.style,
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onError={(e) => {
          console.error("Video playback error:", e);
          console.error("Video source:", src);
          console.error("Video format not supported. Please use MP4 format for better browser compatibility.");
        }}
        onPause={handlePause}
        onSeeked={handleSeeking}
        onEnded={handleEnded}
        onError={(e) => {
          console.error("Video error:", e);
          console.error("Video error details:", e.target.error);
        }}
      />
    </div>
  );
};

ProgressTrackingVideoPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  contentType: PropTypes.string.isRequired,
  contentId: PropTypes.string.isRequired,
  onProgressUpdate: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default ProgressTrackingVideoPlayer;
