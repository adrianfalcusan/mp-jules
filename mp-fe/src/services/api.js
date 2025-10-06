import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from "../utils/constants";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let pendingRequests = [];

async function refreshToken() {
  const currentToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const res = await axios.post(
    `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
    null,
    {
      headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
    }
  );
  if (res.data?.success && res.data?.token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
    return res.data.token;
  }
  throw new Error("Refresh failed");
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          isRefreshing = false;
          pendingRequests.forEach((cb) => cb(newToken));
          pendingRequests = [];
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (e) {
          isRefreshing = false;
          pendingRequests = [];
          // Clear auth data and redirect to login with return path
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          const returnTo = encodeURIComponent(
            window.location.pathname + window.location.search
          );
          // Broadcast a token-refresh-failed event for UI toast listeners
          try {
            window.dispatchEvent(new CustomEvent("auth:refresh-failed"));
          } catch (_) {
            /* no-op */
          }
          window.location.href = `/login?returnTo=${returnTo}`;
          return Promise.reject(error);
        }
      }

      // Queue the request until refresh completes
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

function attachInterceptorsTo(client) {
  // Request token injection
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (e) => Promise.reject(e)
  );

  // 401 handling with refresh + retry
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshToken();
            isRefreshing = false;
            pendingRequests.forEach((cb) => cb(newToken));
            pendingRequests = [];
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          } catch (_) {
            isRefreshing = false;
            pendingRequests = [];
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            const returnTo = encodeURIComponent(
              window.location.pathname + window.location.search
            );
            try {
              window.dispatchEvent(new CustomEvent("auth:refresh-failed"));
            } catch (_) {
              /* no-op */
            }
            window.location.href = `/login?returnTo=${returnTo}`;
            return Promise.reject(error);
          }
        }

        return new Promise((resolve, reject) => {
          pendingRequests.push((token) => {
            if (!token) return reject(error);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          });
        });
      }
      return Promise.reject(error);
    }
  );
}

// Attach to global axios as well for components that import axios directly
attachInterceptorsTo(axios);

// API service methods
export const apiService = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    },

    signup: async (userData) => {
      const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
      return response.data;
    },

    logout: async () => {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    },

    forgotPassword: async (email) => {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      return response.data;
    },

    resetPassword: async (token, newPassword) => {
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });
      return response.data;
    },

    resendVerification: async (email) => {
      const response = await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
        email,
      });
      return response.data;
    },

    verifyEmail: async (token) => {
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token,
      });
      return response.data;
    },
  },

  // Courses
  courses: {
    getAll: async (params = {}) => {
      const response = await api.get(API_ENDPOINTS.COURSES.BASE, { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(API_ENDPOINTS.COURSES.DETAIL(id));
      return response.data;
    },

    getContent: async (id) => {
      const response = await api.get(API_ENDPOINTS.COURSES.CONTENT(id));
      return response.data;
    },

    getMyStudentCourses: async () => {
      const response = await api.get(API_ENDPOINTS.COURSES.MY_STUDENT_COURSES);
      return response.data;
    },

    create: async (courseData) => {
      const response = await api.post(API_ENDPOINTS.COURSES.BASE, courseData);
      return response.data;
    },

    update: async (id, courseData) => {
      const response = await api.put(
        API_ENDPOINTS.COURSES.DETAIL(id),
        courseData
      );
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(API_ENDPOINTS.COURSES.DETAIL(id));
      return response.data;
    },
  },

  // Tutorials
  tutorials: {
    getAll: async (params = {}) => {
      const response = await api.get(API_ENDPOINTS.TUTORIALS.BASE, { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(API_ENDPOINTS.TUTORIALS.DETAIL(id));
      return response.data;
    },

    getContent: async (id) => {
      const response = await api.get(API_ENDPOINTS.TUTORIALS.CONTENT(id));
      return response.data;
    },

    getTracks: async (id) => {
      const response = await api.get(API_ENDPOINTS.TUTORIALS.TRACKS(id));
      return response.data;
    },

    purchase: async (id) => {
      const response = await api.post(API_ENDPOINTS.TUTORIALS.PURCHASE(id));
      return response.data;
    },

    create: async (tutorialData) => {
      const response = await api.post(
        API_ENDPOINTS.TUTORIALS.BASE,
        tutorialData
      );
      return response.data;
    },

    update: async (id, tutorialData) => {
      const response = await api.put(
        API_ENDPOINTS.TUTORIALS.DETAIL(id),
        tutorialData
      );
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(API_ENDPOINTS.TUTORIALS.DETAIL(id));
      return response.data;
    },
  },

  // Teachers
  teachers: {
    getAll: async (params = {}) => {
      const response = await api.get(API_ENDPOINTS.TEACHERS.BASE, { params });
      return response.data;
    },

    getById: async (id) => {
      const response = await api.get(API_ENDPOINTS.TEACHERS.DETAIL(id));
      return response.data;
    },

    getDashboardAnalytics: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.TEACHERS.BASE}/analytics/dashboard`
      );
      return response.data;
    },

    getMyCourses: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.TEACHERS.BASE}/my-courses`
      );
      return response.data;
    },

    getMyTutorials: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.TEACHERS.BASE}/my-tutorials`
      );
      return response.data;
    },
  },

  // Reviews
  reviews: {
    getAll: async (params = {}) => {
      const response = await api.get(API_ENDPOINTS.REVIEWS.BASE, { params });
      return response.data;
    },

    // New unified methods
    getByItem: async (itemType, itemId) => {
      const response = await api.get(
        API_ENDPOINTS.REVIEWS.BY_ITEM(itemType, itemId)
      );
      return response.data;
    },

    getMyReview: async (itemType, itemId) => {
      const response = await api.get(
        API_ENDPOINTS.REVIEWS.MY_REVIEW(itemType, itemId)
      );
      return response.data;
    },

    create: async (reviewData) => {
      const response = await api.post(API_ENDPOINTS.REVIEWS.CREATE, reviewData);
      return response.data;
    },

    update: async (reviewData) => {
      const response = await api.post(API_ENDPOINTS.REVIEWS.CREATE, reviewData);
      return response.data;
    },

    delete: async (reviewId) => {
      const response = await api.delete(API_ENDPOINTS.REVIEWS.DELETE(reviewId));
      return response.data;
    },

    // Legacy methods for backward compatibility
    getByCourse: async (courseId) => {
      const response = await api.get(API_ENDPOINTS.REVIEWS.BY_COURSE(courseId));
      return response.data;
    },

    createCourseReview: async (reviewData) => {
      const response = await api.post(
        API_ENDPOINTS.REVIEWS.COURSE_LEGACY,
        reviewData
      );
      return response.data;
    },
  },

  // Testimonials
  testimonials: {
    getAll: async (params = {}) => {
      const response = await api.get(API_ENDPOINTS.TESTIMONIALS.BASE, {
        params,
      });
      return response.data;
    },

    create: async (testimonialData) => {
      const response = await api.post(
        API_ENDPOINTS.TESTIMONIALS.BASE,
        testimonialData
      );
      return response.data;
    },

    update: async (id, testimonialData) => {
      const response = await api.put(
        `${API_ENDPOINTS.TESTIMONIALS.BASE}/${id}`,
        testimonialData
      );
      return response.data;
    },

    delete: async (id) => {
      const response = await api.delete(
        `${API_ENDPOINTS.TESTIMONIALS.BASE}/${id}`
      );
      return response.data;
    },
  },

  // Users
  users: {
    me: async () => {
      const response = await api.get(API_ENDPOINTS.USERS.ME);
      return response.data;
    },
    updateMe: async (data) => {
      const response = await api.put(API_ENDPOINTS.USERS.ME, data);
      return response.data;
    },
    changePassword: async (payload) => {
      const response = await api.put(API_ENDPOINTS.USERS.PASSWORD, payload);
      return response.data;
    },
  },

  // Payments
  payments: {
    createSession: async (paymentData) => {
      const response = await api.post(
        API_ENDPOINTS.PAYMENTS.CREATE_SESSION,
        paymentData
      );
      return response.data;
    },
  },

  // Admin
  admin: {
    getUsers: async (params = {}) => {
      const response = await api.get(API_ENDPOINTS.ADMIN.USERS, { params });
      return response.data;
    },

    updateUser: async (id, userData) => {
      const response = await api.put(
        `${API_ENDPOINTS.ADMIN.USERS}/${id}`,
        userData
      );
      return response.data;
    },

    deleteUser: async (id) => {
      const response = await api.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`);
      return response.data;
    },

    suspendUser: async (id, suspended) => {
      const response = await api.patch(
        `${API_ENDPOINTS.ADMIN.USERS}/${id}/suspend`,
        { suspended }
      );
      return response.data;
    },

    getCourses: async (params = {}) => {
      const response = await api.get(API_ENDPOINTS.ADMIN.COURSES, { params });
      return response.data;
    },

    getTutorials: async (params = {}) => {
      const response = await api.get(`${API_ENDPOINTS.ADMIN.BASE}/tutorials`, {
        params,
      });
      return response.data;
    },

    getAnalytics: async (params = {}) => {
      const response = await api.get(API_ENDPOINTS.ADMIN.ANALYTICS, { params });
      return response.data;
    },

    getPendingContent: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.ADMIN.BASE}/content/pending`
      );
      return response.data;
    },

    approveContent: async (type, id) => {
      const response = await api.patch(
        `${API_ENDPOINTS.ADMIN.BASE}/content/${type}/${id}/approve`
      );
      return response.data;
    },

    rejectContent: async (type, id, reason) => {
      const response = await api.patch(
        `${API_ENDPOINTS.ADMIN.BASE}/content/${type}/${id}/reject`,
        { reason }
      );
      return response.data;
    },

    getPlatformStats: async () => {
      const response = await api.get(
        `${API_ENDPOINTS.ADMIN.BASE}/platform-stats`
      );
      return response.data;
    },
  },

  // Progress Tracking
  progress: {
    startSession: async (sessionData) => {
      const response = await api.post(
        API_ENDPOINTS.PROGRESS.START_SESSION,
        sessionData
      );
      return response.data;
    },

    updateProgress: async (progressData) => {
      const response = await api.post(
        API_ENDPOINTS.PROGRESS.UPDATE,
        progressData
      );
      return response.data;
    },

    getUserStats: async () => {
      const response = await api.get(API_ENDPOINTS.PROGRESS.USER_STATS);
      return response.data;
    },

    getContentProgress: async (contentType, contentId) => {
      const response = await api.get(
        API_ENDPOINTS.PROGRESS.CONTENT_PROGRESS(contentType, contentId)
      );
      return response.data;
    },

    getStreakData: async (days = 30) => {
      const response = await api.get(API_ENDPOINTS.PROGRESS.STREAK, {
        params: { days },
      });
      return response.data;
    },
  },

  // File uploads
  upload: {
    file: async (file, onProgress) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    },

    video: async (file, onProgress) => {
      const formData = new FormData();
      formData.append("video", file);

      const response = await api.post("/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    },

    image: async (file, onProgress) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    },
  },
};

export default api;
