import { useState, useEffect, useCallback } from "react";
import { apiService } from "../../../services/api";

export const useProgress = () => {
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user progress statistics
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await apiService.progress.getUserStats();
      if (response.success) {
        setUserStats(response.stats);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setError(err.message);
    }
  }, []);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async () => {
    try {
      const response = await apiService.progress.getStreakData(7); // Last 7 days
      if (response.success) {
        setRecentActivity(response.recentActivity || []);
      }
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  }, []);

  // Fetch streak data
  const fetchStreakData = useCallback(async (days = 30) => {
    try {
      const response = await apiService.progress.getStreakData(days);
      if (response.success) {
        setStreakData(response);
      }
    } catch (err) {
      console.error("Error fetching streak data:", err);
    }
  }, []);

  // Update progress for specific content
  const updateProgress = useCallback(
    async (contentType, contentId, progressData) => {
      try {
        const response = await apiService.progress.updateProgress({
          contentType,
          contentId,
          ...progressData,
        });

        if (response.success) {
          // Refresh user stats after update
          await fetchUserStats();
          await fetchRecentActivity();
          return response;
        }
      } catch (err) {
        console.error("Error updating progress:", err);
        throw err;
      }
    },
    [fetchUserStats, fetchRecentActivity]
  );

  // Start a learning session
  const startSession = useCallback(async (contentType, contentId) => {
    try {
      const response = await apiService.progress.startSession({
        contentType,
        contentId,
      });

      if (response.success) {
        return response.sessionId;
      }
    } catch (err) {
      console.error("Error starting session:", err);
      throw err;
    }
  }, []);

  // Get progress for specific content
  const getContentProgress = useCallback(async (contentType, contentId) => {
    try {
      const response = await apiService.progress.getContentProgress(
        contentType,
        contentId
      );
      if (response.success) {
        return response.progress;
      }
    } catch (err) {
      console.error("Error fetching content progress:", err);
      return null;
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchUserStats(),
          fetchRecentActivity(),
          fetchStreakData(),
        ]);
      } catch (err) {
        setError("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchUserStats, fetchRecentActivity, fetchStreakData]);

  return {
    // Data
    userStats,
    recentActivity,
    streakData,
    loading,
    error,

    // Actions
    updateProgress,
    startSession,
    getContentProgress,
    refresh: async () => {
      await Promise.all([
        fetchUserStats(),
        fetchRecentActivity(),
        fetchStreakData(),
      ]);
    },
  };
};

export const useContentProgress = (contentType, contentId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getContentProgress, updateProgress } = useProgress();

  useEffect(() => {
    if (contentType && contentId) {
      const loadProgress = async () => {
        setLoading(true);
        try {
          const progressData = await getContentProgress(contentType, contentId);
          setProgress(progressData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      loadProgress();
    }
  }, [contentType, contentId, getContentProgress]);

  const updateContentProgress = useCallback(
    async (progressData) => {
      try {
        const result = await updateProgress(
          contentType,
          contentId,
          progressData
        );
        if (result.success) {
          setProgress(result.progress);
        }
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [contentType, contentId, updateProgress]
  );

  return {
    progress,
    loading,
    error,
    updateProgress: updateContentProgress,
  };
};

export default useProgress;
