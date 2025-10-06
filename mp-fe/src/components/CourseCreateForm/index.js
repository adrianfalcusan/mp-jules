// src/components/CourseCreateForm/index.js
import React, { useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { motion } from "framer-motion";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const CourseCreateForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    // We no longer track "image" because we're using "thumbnail"
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [feedback, setFeedback] = useState({ success: "", error: "" });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Called whenever a user selects a file
  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  // 1) Upload the thumbnail file to S3 (via your backend endpoint)
  const uploadThumbnail = async () => {
    if (!thumbnailFile) return "";
    try {
      // We build the request body for /courses/upload-thumbnail
      const payload = {
        filename: thumbnailFile.name,
        contentType: thumbnailFile.type || "image/jpeg",
      };

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/courses/upload-thumbnail`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(
          res.data.message || "Thumbnail upload failed (presign)."
        );
      }

      const { presignedUrl, s3Key } = res.data;

      // Use the presigned URL to actually upload the file to S3
      await axios.put(presignedUrl, thumbnailFile, {
        headers: { "Content-Type": payload.contentType },
      });

      // Return the s3Key to store it in the course doc
      return s3Key;
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      setFeedback({
        success: "",
        error: err.response?.data?.message || err.message,
      });
      return "";
    }
  };

  // 2) Create the course
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ success: "", error: "" });

    try {
      // First, upload the thumbnail if provided
      const thumbnailKey = await uploadThumbnail();

      // Then create the course with the "thumbnail" field set to the s3Key
      const body = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        thumbnail: thumbnailKey, // The S3 key we got from upload
      };

      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/courses`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create course.");
      }

      setFeedback({
        success: `Course created: ${res.data.course.title}`,
        error: "",
      });
      // Clear the form
      setFormData({ title: "", description: "", price: "" });
      setThumbnailFile(null);
    } catch (err) {
      setFeedback({
        success: "",
        error: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Create New Course
        </Typography>

        {feedback.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {feedback.error}
          </Alert>
        )}
        {feedback.success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {feedback.success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            required
            multiline
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Price"
            variant="outlined"
            fullWidth
            required
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload Thumbnail
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleThumbnailChange}
            />
          </Button>
          {thumbnailFile && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected Thumbnail: {thumbnailFile.name}
            </Typography>
          )}

          <Button type="submit" variant="contained" color="primary">
            Create Course
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
};

export default CourseCreateForm;
