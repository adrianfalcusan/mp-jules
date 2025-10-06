const axios = require("axios");

async function testLogin() {
  try {
    console.log("🔐 Testing login...");

    const response = await axios.post(
      "http://localhost:8080/api/auth/login",
      {
        email: "teacher@test.com",
        password: "password123",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Login successful!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("❌ Login failed:");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message);
    console.error("Full response:", error.response?.data);
  }
}

testLogin();
