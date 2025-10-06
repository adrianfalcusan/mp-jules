// API Configuration
import ENV from "../config/environment";

export const API_BASE_URL = ENV.API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    RESEND_VERIFICATION: "/auth/resend-verification",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // Dashboard
  DASHBOARD: {
    BASE: "/dashboard",
    ACTIVITY_CHART: "/dashboard/activity-chart",
  },

  // Courses
  COURSES: {
    BASE: "/courses",
    MY_STUDENT_COURSES: "/courses/my-student-courses",
    DETAIL: (id) => `/courses/${id}`,
    CONTENT: (id) => `/courses/${id}/content`,
  },

  // Tutorials
  TUTORIALS: {
    BASE: "/tutorials",
    DETAIL: (id) => `/tutorials/${id}`,
    CONTENT: (id) => `/tutorials/${id}/content`,
    PURCHASE: (id) => `/tutorials/${id}/purchase`,
    TRACKS: (id) => `/tutorials/${id}/tracks`,
  },

  // Teachers
  TEACHERS: {
    BASE: "/teachers",
    DETAIL: (id) => `/teachers/${id}`,
  },

  // Reviews
  REVIEWS: {
    BASE: "/reviews",
    CREATE: "/reviews",
    BY_ITEM: (itemType, itemId) => `/reviews/${itemType}/${itemId}`,
    MY_REVIEW: (itemType, itemId) => `/reviews/${itemType}/${itemId}/my-review`,
    DELETE: (reviewId) => `/reviews/${reviewId}`,
    // Legacy endpoints
    BY_COURSE: (courseId) => `/reviews/course/${courseId}`,
    COURSE_LEGACY: "/reviews/course",
  },

  // Testimonials
  TESTIMONIALS: {
    BASE: "/testimonials",
  },

  // Payments
  PAYMENTS: {
    CREATE_SESSION: "/payments/create-session",
    WEBHOOK: "/payments/webhook",
  },

  // Users
  USERS: {
    ME: "/users/me",
    PASSWORD: "/users/me/password",
  },

  // Admin
  ADMIN: {
    BASE: "/admin",
    USERS: "/admin/users",
    COURSES: "/admin/courses",
    ANALYTICS: "/admin/analytics",
  },

  // Progress Tracking
  PROGRESS: {
    BASE: "/progress",
    UPDATE: "/progress/update",
    START_SESSION: "/progress/start-session",
    USER_STATS: "/progress/user",
    CONTENT_PROGRESS: (contentType, contentId) =>
      `/progress/content/${contentType}/${contentId}`,
    STREAK: "/progress/streak",
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: "user",
  TOKEN: "token",
  THEME: "theme",
  LANGUAGE: "language",
};

// Form Validation
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/,
  },
};

// User Roles
export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

// Course Categories
export const COURSE_CATEGORIES = {
  PIANO: "piano",
  GUITAR: "guitar",
  DRUMS: "drums",
  VOCALS: "vocals",
  THEORY: "theory",
};

// Course Levels
export const COURSE_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
};

// UI Configuration
export const UI_CONFIG = {
  DRAWER_WIDTH: 240,
  NAVBAR_HEIGHT: 64,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  },
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920,
  },
};

// Animation Configuration
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  EASING: {
    EASE_IN: "easeIn",
    EASE_OUT: "easeOut",
    EASE_IN_OUT: "easeInOut",
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. Insufficient permissions.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  SIGNUP_SUCCESS: "Account created successfully!",
  LOGOUT_SUCCESS: "Logged out successfully!",
  COURSE_CREATED: "Course created successfully!",
  COURSE_UPDATED: "Course updated successfully!",
  ENROLLMENT_SUCCESS: "Successfully enrolled in course!",
  REVIEW_SUBMITTED: "Review submitted successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/avi", "video/mov", "video/wmv"],
  ALLOWED_AUDIO_TYPES: ["audio/mp3", "audio/wav", "audio/ogg"],
};

// Theme Configuration
export const THEME_CONFIG = {
  BRAND_COLOR: "#2F80FF",
  DARK_MODE: "dark",
  LIGHT_MODE: "light",
};

// Default Values
export const DEFAULT_VALUES = {
  COURSE: {
    PRICE: 0,
    DURATION: 60,
    LEVEL: COURSE_LEVELS.BEGINNER,
    CATEGORY: COURSE_CATEGORIES.PIANO,
  },
  USER: {
    ROLE: USER_ROLES.STUDENT,
  },
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
};
