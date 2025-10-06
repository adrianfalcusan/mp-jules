// src/config/environment.js
/* eslint-disable no-undef */
export const ENV = {
  API_BASE_URL:
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

export default ENV;
