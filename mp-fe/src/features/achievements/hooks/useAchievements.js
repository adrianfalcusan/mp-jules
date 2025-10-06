import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ENV from "../../../config/environment";

// Helpers to normalize API responses
function normalizeAllAchievements(payload) {
  const ach = payload?.achievements;
  if (Array.isArray(ach)) return ach;
  if (ach && typeof ach === "object") {
    // Backend returns grouped by category: { [category]: Achievement[] }
    return Object.values(ach).flat();
  }
  return [];
}

function normalizeUserAchievements(payload) {
  // Accept either { userAchievements: [...] } or { achievements: [...] }
  const raw = Array.isArray(payload?.userAchievements)
    ? payload.userAchievements
    : Array.isArray(payload?.achievements)
      ? payload.achievements
      : [];

  // Normalize to a common shape: { achievement: { _id?, name, description, icon, points }, isCompleted, progress, unlockedAt }
  return raw.map((ua) => {
    if (ua && ua.achievement) {
      // Already nested shape
      return ua;
    }
    const {
      _id,
      name,
      description,
      icon,
      points,
      isCompleted,
      progress,
      unlockedAt,
    } = ua || {};
    return {
      achievement: { _id, name, description, icon, points },
      isCompleted: !!isCompleted,
      progress: Number(progress || 0),
      unlockedAt: unlockedAt || null,
    };
  });
}

// Create achievements API service
const achievementsAPI = {
  getAll: async () => {
    const response = await axios.get(`${ENV.API_BASE_URL}/achievements`);
    return response.data;
  },

  getUserAchievements: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${ENV.API_BASE_URL}/achievements/user`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  checkProgress: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${ENV.API_BASE_URL}/achievements/check-progress`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },
};

export const useAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);

  // Fetch all available achievements
  const fetchAchievements = useCallback(async () => {
    try {
      const response = await achievementsAPI.getAll();
      if (response.success) {
        setAchievements(normalizeAllAchievements(response));
      }
    } catch (err) {
      console.error("Error fetching achievements:", err);
      setError(err.message);
    }
  }, []);

  // Fetch user's achievement progress
  const fetchUserAchievements = useCallback(async () => {
    try {
      const response = await achievementsAPI.getUserAchievements();
      if (response.success) {
        setUserAchievements(normalizeUserAchievements(response));
      }
    } catch (err) {
      console.error("Error fetching user achievements:", err);
      setError(err.message);
    }
  }, []);

  // Check for new achievement progress
  const checkProgress = useCallback(async () => {
    try {
      const response = await achievementsAPI.checkProgress();
      if (response.success) {
        // Backend returns { newAchievements: [...] }
        const previouslyCompleted = new Set(
          userAchievements
            .filter((ua) => ua.isCompleted)
            .map((ua) => ua.achievement._id || ua.achievement.name)
        );

        const unlocked = (response.newAchievements || []).map((a) => ({
          achievement: a,
          isCompleted: true,
          progress: a.criteria?.value || 100,
          unlockedAt: a.unlockedAt || new Date().toISOString(),
        }));

        const newlyCompleted = unlocked.filter(
          (ua) =>
            !previouslyCompleted.has(ua.achievement._id || ua.achievement.name)
        );

        if (newlyCompleted.length > 0) {
          setNewlyUnlocked(newlyCompleted);
          setTimeout(() => setNewlyUnlocked([]), 5000);
        }

        // Merge unlocked into user achievements
        setUserAchievements((prev) => {
          const map = new Map(
            prev.map((ua) => [ua.achievement._id || ua.achievement.name, ua])
          );
          newlyCompleted.forEach((ua) => {
            map.set(ua.achievement._id || ua.achievement.name, ua);
          });
          return Array.from(map.values());
        });

        return response;
      }
    } catch (err) {
      console.error("Error checking achievement progress:", err);
      throw err;
    }
  }, [userAchievements]);

  // Get combined achievement data with user progress
  const getCombinedAchievements = useCallback(() => {
    return achievements.map((achievement) => {
      const key = achievement._id || achievement.name;
      const userProgress = userAchievements.find(
        (ua) => (ua.achievement._id || ua.achievement.name) === key
      );

      return {
        ...achievement,
        userProgress: userProgress
          ? {
              progress: userProgress.progress,
              isCompleted: userProgress.isCompleted,
              unlockedAt: userProgress.unlockedAt,
            }
          : { progress: 0, isCompleted: false, unlockedAt: null },
      };
    });
  }, [achievements, userAchievements]);

  // Get user's total points
  const getTotalPoints = useCallback(() => {
    return userAchievements
      .filter((ua) => ua.isCompleted)
      .reduce((total, ua) => total + (ua.achievement?.points || 0), 0);
  }, [userAchievements]);

  // Get completion statistics
  const getStats = useCallback(() => {
    const total = achievements.length;
    const completed = userAchievements.filter((ua) => ua.isCompleted).length;
    const inProgress = userAchievements.filter(
      (ua) => !ua.isCompleted && ua.progress > 0
    ).length;
    const totalPoints = getTotalPoints();

    return {
      total,
      completed,
      inProgress,
      notStarted: total - completed - inProgress,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      totalPoints,
    };
  }, [achievements, userAchievements, getTotalPoints]);

  // Get achievements by category
  const getByCategory = useCallback(
    (category) =>
      getCombinedAchievements().filter((a) => a.category === category),
    [getCombinedAchievements]
  );

  // Get recently unlocked achievements
  const getRecentlyUnlocked = useCallback(
    (days = 7) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return getCombinedAchievements()
        .filter((achievement) => {
          if (
            !achievement.userProgress.isCompleted ||
            !achievement.userProgress.unlockedAt
          ) {
            return false;
          }
          return new Date(achievement.userProgress.unlockedAt) >= cutoffDate;
        })
        .sort(
          (a, b) =>
            new Date(b.userProgress.unlockedAt) -
            new Date(a.userProgress.unlockedAt)
        );
    },
    [getCombinedAchievements]
  );

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchAchievements(), fetchUserAchievements()]);
      } catch (err) {
        setError("Failed to load achievements data");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchAchievements, fetchUserAchievements]);

  return {
    // Data
    achievements,
    userAchievements,
    combinedAchievements: getCombinedAchievements(),
    newlyUnlocked,
    loading,
    error,

    // Stats
    stats: getStats(),
    totalPoints: getTotalPoints(),

    // Actions
    checkProgress,
    refresh: async () => {
      await Promise.all([fetchAchievements(), fetchUserAchievements()]);
    },
    clearNotifications: () => setNewlyUnlocked([]),

    // Getters
    getByCategory,
    getRecentlyUnlocked,
  };
};

export const useAchievementNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((achievement) => {
    const notification = {
      id: Date.now(),
      achievement,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
};

export default useAchievements;
