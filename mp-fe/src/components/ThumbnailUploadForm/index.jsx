// src/components/ThumbnailUploadForm/index.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  MenuItem,
} from "@mui/material";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const ThumbnailUploadForm = () => {
  const token = localStorage.getItem("token");
  const user = useSelector((state) => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch teacher courses
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/courses/my-teacher-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setCourses(res.data.courses);
        }
      } catch (err) {
        console.error("Error fetching teacher courses:", err);
      }
    };
    fetchTeacherCourses();
  }, [token]);

  const handleCourseChange = (e) => setSelectedCourse(e.target.value);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setMessage("");
    setError("");

    if (!thumbnailFile || !selectedCourse) {
      setError("Please select a course and a thumbnail file.");
      return;
    }

    const fileName = thumbnailFile.name;
    const contentType = thumbnailFile.type || "image/jpeg"; // fallback

    try {
      const payload = { filename: fileName, contentType };
      const presignRes = await axios.post(
        `${API_BASE}/courses/${selectedCourse}/upload-thumbnail`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!presignRes.data.success) {
        setError(presignRes.data.message || "Presign request failed.");
        return;
      }
      const { presignedUrl, s3Key } = presignRes.data;
      await axios.put(presignedUrl, thumbnailFile, {
        headers: { "Content-Type": contentType },
      });
      setMessage(`Thumbnail upload successful! S3 Key: ${s3Key}`);
    } catch (err) {
      console.error("Thumbnail upload error:", err);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upload Course Thumbnail
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <TextField
        select
        label="Select Course"
        variant="outlined"
        fullWidth
        value={selectedCourse}
        onChange={handleCourseChange}
        sx={{ mb: 2 }}
      >
        {courses.map((course) => (
          <MenuItem key={course._id} value={course._id}>
            {course.title}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Select Thumbnail File
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>
      {thumbnailFile && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Selected: {thumbnailFile.name}
        </Typography>
      )}
      <Button variant="contained" color="secondary" onClick={handleUpload}>
        Upload Thumbnail
      </Button>
    </Box>
  );
};

export default ThumbnailUploadForm;
