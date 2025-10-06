// src/components/SessionTracker/index.jsx
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useProgressTracking } from "../../hooks/useProgressTracking";

const SessionTracker = ({
  contentType,
  contentId,
  children,
  onProgressUpdate,
}) => {
  const {
    progress,
    startSession,
    stopSession,
    loadProgress,
    getCurrentVideoWatchTime,
  } = useProgressTracking(contentType, contentId);

  // Initialize session tracking
  useEffect(() => {
    if (contentType && contentId) {
      console.log("SessionTracker: Loading progress and starting session");
      loadProgress();
      startSession();
    }

    return () => {
      console.log("SessionTracker: Stopping session");
      stopSession();
    };
    // eslint-disable-next-line
  }, [contentType, contentId]); // Remove function dependencies to prevent infinite loop

  // Call progress update callback when progress changes
  useEffect(() => {
    if (onProgressUpdate && progress) {
      onProgressUpdate({
        progress: progress.progressPercentage,
        timeSpent: progress.timeSpent,
        videoWatchTime: getCurrentVideoWatchTime(),
        isCompleted: progress.isCompleted,
        completedSections: progress.completedSections,
      });
    }
  }, [progress, onProgressUpdate, getCurrentVideoWatchTime]);

  return <div>{children}</div>;
};

SessionTracker.propTypes = {
  contentType: PropTypes.string.isRequired,
  contentId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onProgressUpdate: PropTypes.func,
};

export default SessionTracker;
