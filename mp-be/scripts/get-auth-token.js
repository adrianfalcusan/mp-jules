// scripts/get-auth-token.js
const axios = require("axios");

async function getAuthToken() {
  try {
    // Login with one of the enrolled users
    const response = await axios.post("http://localhost:8080/api/auth/login", {
      email: "adrian@falcusan.ro",
      password: "password123", // You might need to adjust this password
    });

    if (response.data.success) {
      console.log("Login successful!");
      console.log("Token:", response.data.token);
      console.log("User:", response.data.user.name);
      return response.data.token;
    } else {
      console.error("Login failed:", response.data.message);
    }
  } catch (error) {
    console.error(
      "Error getting auth token:",
      error.response?.data || error.message
    );
  }
}

// Run the script
getAuthToken();
