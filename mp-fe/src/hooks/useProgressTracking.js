// src/hooks/useProgressTracking.js
import { useState, useCallback, useRef } from "react";
import { apiService } from "../services/api";

export const useProgressTracking = (contentType, contentId) => {
  const [progress, setProgress] = useState({
    progressPercentage: 0,
    timeSpent: 0,
    lastPosition: 0,
    isCompleted: false,
    completedSections: [],
  });
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);

  // Refs to track video watch time (not session time)
  const videoStartTime = useRef(null);
  const totalVideoWatchTime = useRef(0);
  const lastProgressUpdate = useRef(Date.now());

  // Use refs to store current values without causing re-renders
  const isTrackingRef = useRef(false);
  const progressRef = useRef(progress);

  // Update refs when state changes
  isTrackingRef.current = isTracking;
  progressRef.current = progress;

  // Start tracking session
  const startSession = useCallback(async () => {
    try {
      setError(null);
      console.log("Starting progress tracking session:", {
        contentType,
        contentId,
      });

      const response = await apiService.progress.startSession({
        contentType,
        contentId,
      });

      if (response.success) {
        setProgress(response.data.progress);
        setIsTracking(true);
        totalVideoWatchTime.current = 0; // Reset video watch time
        lastProgressUpdate.current = Date.now();

        console.log("Progress tracking started:", response.data.progress);
      }
    } catch (err) {
      console.error("Failed to start progress tracking:", err);
      setError("Failed to start tracking session");
    }
  }, [contentType, contentId]);

  // Start video watching (called when video plays)
  const startVideoWatching = useCallback(() => {
    if (isTrackingRef.current) {
      videoStartTime.current = Date.now();
      console.log("Started video watching timer");
    }
  }, []);

  // Stop video watching (called when video pauses/ends)
  const stopVideoWatching = useCallback(() => {
    if (isTrackingRef.current && videoStartTime.current) {
      const watchTime = (Date.now() - videoStartTime.current) / 1000 / 60; // Convert to minutes
      totalVideoWatchTime.current += watchTime;
      videoStartTime.current = null;
      console.log(
        `Added ${watchTime.toFixed(2)} minutes of video watch time. Total: ${totalVideoWatchTime.current.toFixed(2)} minutes`
      );
    }
  }, []);

  // Update progress with actual video watch time
  const updateProgress = useCallback(
    async (newData = {}) => {
      if (!isTrackingRef.current) return;

      try {
        // Calculate time since last update (only if video is currently playing)
        let additionalWatchTime = 0;
        if (videoStartTime.current) {
          const currentWatchTime =
            (Date.now() - videoStartTime.current) / 1000 / 60;
          additionalWatchTime = currentWatchTime;
          totalVideoWatchTime.current += currentWatchTime;
          videoStartTime.current = Date.now(); // Reset timer
        }

        const updateData = {
          contentType,
          contentId,
          timeSpentMinutes: additionalWatchTime, // Only send the additional watch time
          ...newData,
        };

        console.log("Updating progress with video watch time:", updateData);

        const response = await apiService.progress.updateProgress(updateData);

        if (response.success) {
          setProgress(response.data.progress);
          console.log("Progress updated:", response.data.progress);
        }
      } catch (err) {
        console.error("Failed to update progress:", err);
        setError("Failed to update progress");
      }
    },
    [contentType, contentId]
  );

  // Update only the last video position during playback (do not change % here)
  const updateVideoPosition = useCallback(
    (position) => {
      if (!isTrackingRef.current) return;
      updateProgress({
        lastPosition: Math.round(position),
      });
    },
    [updateProgress]
  );

  // Mark section as completed
  const completeSection = useCallback(
    async (sectionId) => {
      if (!isTrackingRef.current) return;

      try {
        await updateProgress({
          sectionId,
          progressPercentage: progressRef.current.progressPercentage, // Keep current progress
        });
        console.log("Section completed:", sectionId);
      } catch (err) {
        console.error("Failed to complete section:", err);
      }
    },
    [updateProgress]
  );

  // Mark content as completed
  const completeContent = useCallback(async () => {
    if (!isTrackingRef.current) return;

    try {
      // Stop video watching timer if running
      stopVideoWatching();

      await updateProgress({
        progressPercentage: 100,
      });
      console.log("Content completed:", contentType, contentId);
    } catch (err) {
      console.error("Failed to complete content:", err);
    }
  }, [contentType, contentId, updateProgress, stopVideoWatching]);

  // Stop tracking session
  const stopSession = useCallback(async () => {
    if (!isTrackingRef.current) return;

    try {
      // Stop video watching timer if running
      stopVideoWatching();

      // Final progress update with remaining watch time
      if (totalVideoWatchTime.current > 0) {
        await updateProgress();
      }

      setIsTracking(false);
      totalVideoWatchTime.current = 0;
      videoStartTime.current = null;

      console.log("Progress tracking session stopped");
    } catch (err) {
      console.error("Failed to stop progress tracking:", err);
    }
  }, [updateProgress, stopVideoWatching]);

  // Load existing progress
  const loadProgress = useCallback(async () => {
    try {
      setError(null);
      const response = await apiService.progress.getContentProgress(
        contentType,
        contentId
      );

      if (response.success) {
        setProgress(response.data.progress);
        console.log("Loaded existing progress:", response.data.progress);
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
      setError("Failed to load progress");
    }
  }, [contentType, contentId]);

  // Get current video watch time for display
  const getCurrentVideoWatchTime = useCallback(() => {
    return totalVideoWatchTime.current;
  }, []);

  return {
    progress,
    isTracking,
    error,
    startSession,
    stopSession,
    startVideoWatching,
    stopVideoWatching,
    updateProgress,
    updateVideoPosition,
    completeSection,
    completeContent,
    loadProgress,
    getCurrentVideoWatchTime,
  };
};
