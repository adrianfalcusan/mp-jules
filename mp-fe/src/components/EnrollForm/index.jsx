// src/components/EnrollForm/index.jsx
import React, { useState, useCallback } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { motion } from "framer-motion";
import ENV from "../../config/environment";

const API_BASE = ENV.API_BASE_URL;

const EnrollForm = () => {
  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleEnroll = useCallback(async () => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await axios.post(
        `${API_BASE}/admin/enroll`,
        { userId, courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSuccessMsg(res.data.message);
      } else {
        setErrorMsg(res.data.message || "Failed to enroll user");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message);
    }
  }, [userId, courseId, token]);

  const handleUserIdChange = useCallback((e) => {
    setUserId(e.target.value);
  }, []);

  const handleCourseIdChange = useCallback((e) => {
    setCourseId(e.target.value);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Enroll a User to a Course
        </Typography>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}
        <TextField
          label="User ID"
          variant="outlined"
          fullWidth
          value={userId}
          onChange={handleUserIdChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Course ID"
          variant="outlined"
          fullWidth
          value={courseId}
          onChange={handleCourseIdChange}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleEnroll}>
          Enroll User
        </Button>
      </Box>
    </motion.div>
  );
};

export default React.memo(EnrollForm);
