import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  School as CourseIcon,
  VideoLibrary as VideoIcon,
  VideoLibrary as VideoLibraryIcon,
  LibraryMusic as LibraryMusicIcon,
  PictureAsPdf as PictureAsPdfIcon,
  AttachFile as AttachFileIcon,
  AttachMoney as PriceIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Preview as PreviewIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

import Layout from "../../components/Layout";
import api, { apiService } from "../../services/api";

const designSystem = {
  colors: {
    primary: {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    secondary: {
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    success: {
      gradient: "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
    },
    warning: {
      gradient: "linear-gradient(135deg, #ffd93d 0%, #ff9500 100%)",
    },
    background: {
      main: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
  },
};

const steps = [
  "Basic Info",
  "Content & Pricing",
  "Lessons",
  "Review & Publish",
];

const CourseCreatePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Redirect if not teacher or admin
  useEffect(() => {
    if (user && !["teacher", "admin"].includes(user.role)) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    level: "beginner",
    category: "Music",
    tags: [],
    requirements: [],
    learningOutcomes: [],
    thumbnailFile: null,
    thumbnailUrl: "",
    lessons: [],
    status: "draft",
  });

  const [currentLesson, setCurrentLesson] = useState({
    title: "",
    description: "",
    videoFile: null,
    duration: "",
    // Enhanced material uploads
    multitrackFiles: [],
    pdfFiles: [],
    resourceFiles: [],
    // Material metadata
    materials: {
      multitracks: [],
      pdfs: [],
      resources: []
    }
  });

  const handleInputChange = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleArrayFieldAdd = (field, value) => {
    if (value.trim()) {
      setCourseData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const handleArrayFieldRemove = (field, index) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          thumbnail: "File size must be less than 5MB",
        }));
        return;
      }
      setCourseData((prev) => ({
        ...prev,
        thumbnailFile: file,
        thumbnailUrl: URL.createObjectURL(file),
      }));
    }
  };

  const addLesson = () => {
    if (currentLesson.title && currentLesson.description) {
      // Process materials for the lesson - store metadata only, not file objects
      const processedMaterials = {
        multitracks: currentLesson.multitrackFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          size: file.size,
          lastModified: file.lastModified
        })),
        pdfs: currentLesson.pdfFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          size: file.size,
          lastModified: file.lastModified
        })),
        resources: currentLesson.resourceFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          size: file.size,
          lastModified: file.lastModified
        }))
      };

      setCourseData((prev) => ({
        ...prev,
        lessons: [
          ...prev.lessons,
          { 
            ...currentLesson, 
            order: prev.lessons.length + 1,
            materials: processedMaterials,
            // Store file objects separately for upload processing
            _files: {
              video: currentLesson.videoFile,
              multitracks: currentLesson.multitrackFiles,
              pdfs: currentLesson.pdfFiles,
              resources: currentLesson.resourceFiles
            }
          },
        ],
      }));
      setCurrentLesson({
        title: "",
        description: "",
        videoFile: null,
        duration: "",
        multitrackFiles: [],
        pdfFiles: [],
        resourceFiles: [],
        materials: {
          multitracks: [],
          pdfs: [],
          resources: []
        }
      });
    }
  };

  const removeLesson = (index) => {
    setCourseData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Info
        if (!courseData.title.trim()) newErrors.title = "Title is required";
        if (!courseData.description.trim())
          newErrors.description = "Description is required";
        break;
      case 1: // Content & Pricing
        if (!courseData.price || courseData.price <= 0)
          newErrors.price = "Valid price is required";
        if (!courseData.thumbnailFile && !courseData.thumbnailUrl)
          newErrors.thumbnail = "Thumbnail is required";
        break;
      case 2: // Lessons
        if (courseData.lessons.length === 0)
          newErrors.lessons = "At least one lesson is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const saveDraft = async () => {
    try {
      setLoading(true);

      // First upload thumbnail to Bunny CDN if provided
      let thumbnailKey = "";
      if (courseData.thumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", courseData.thumbnailFile);

        try {
          const response = await api.post("/bunny-upload/bunny-thumbnail", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (response.data.success) {
            // Extract only the fileName from the Bunny CDN response object
            thumbnailKey = response.data.fileName;
          }
        } catch (uploadError) {
          console.error("Bunny CDN thumbnail upload failed:", uploadError);
          alert("Failed to upload thumbnail to Bunny CDN. Please try again.");
          return;
        }
      }

      // Process lesson files and upload them
      const processedLessons = [];
      
      for (const lesson of courseData.lessons) {
        const processedLesson = {
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          order: lesson.order,
          materials: lesson.materials || { multitracks: [], pdfs: [], resources: [] }
        };

        // Upload video if present
        if (lesson._files?.video) {
          console.log("Uploading video to Bunny CDN for lesson:", lesson.title, lesson._files.video);
          try {
            const videoFormData = new FormData();
            videoFormData.append("video", lesson._files.video);
            const videoResponse = await api.post("/bunny-upload/bunny-video", videoFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Bunny CDN video upload response:", videoResponse.data);
            if (videoResponse.data.success) {
              // Extract only the URL from the Bunny CDN response object
              processedLesson.videoUrl = videoResponse.data.url;
              processedLesson.videoKey = videoResponse.data.fileName;
              processedLesson.videoProvider = "bunnycdn";
              console.log("Bunny CDN video URL set:", processedLesson.videoUrl);
            }
          } catch (videoError) {
            console.error("Bunny CDN video upload failed:", videoError);
          }
        } else {
          console.log("No video file found for lesson:", lesson.title);
        }

        // Upload multitrack files to Bunny CDN
        if (lesson._files?.multitracks?.length > 0) {
          for (let i = 0; i < lesson._files.multitracks.length; i++) {
            try {
              const multitrackFormData = new FormData();
              multitrackFormData.append("audio", lesson._files.multitracks[i]);
              const multitrackResponse = await api.post("/bunny-upload/bunny-audio", multitrackFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (multitrackResponse.data.success) {
                // Extract only the URL from the Bunny CDN response object
                processedLesson.materials.multitracks[i].url = multitrackResponse.data.url;
                processedLesson.materials.multitracks[i].key = multitrackResponse.data.fileName;
              }
            } catch (multitrackError) {
              console.error("Bunny CDN multitrack upload failed:", multitrackError);
            }
          }
        }

        // Upload PDF files to Bunny CDN
        if (lesson._files?.pdfs?.length > 0) {
          for (let i = 0; i < lesson._files.pdfs.length; i++) {
            try {
              const pdfFormData = new FormData();
              pdfFormData.append("document", lesson._files.pdfs[i]);
              const pdfResponse = await api.post("/bunny-upload/bunny-document", pdfFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (pdfResponse.data.success) {
                // Extract only the URL from the Bunny CDN response object
                processedLesson.materials.pdfs[i].url = pdfResponse.data.url;
                processedLesson.materials.pdfs[i].key = pdfResponse.data.fileName;
              }
            } catch (pdfError) {
              console.error("Bunny CDN PDF upload failed:", pdfError);
            }
          }
        }

        // Upload resource files to Bunny CDN
        if (lesson._files?.resources?.length > 0) {
          for (let i = 0; i < lesson._files.resources.length; i++) {
            try {
              const resourceFormData = new FormData();
              resourceFormData.append("file", lesson._files.resources[i]);
              const resourceResponse = await api.post("/bunny-upload/bunny-document", resourceFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (resourceResponse.data.success) {
                // Extract only the URL from the Bunny CDN response object
                processedLesson.materials.resources[i].url = resourceResponse.data.url;
                processedLesson.materials.resources[i].key = resourceResponse.data.fileName;
              }
            } catch (resourceError) {
              console.error("Bunny CDN resource upload failed:", resourceError);
            }
          }
        }

        processedLessons.push(processedLesson);
      }

      // Prepare course data
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        price: parseFloat(courseData.price) || 0,
        level: courseData.level,
        category: courseData.category,
        tags: courseData.tags,
        requirements: courseData.requirements,
        learningOutcomes: courseData.learningOutcomes,
        lessons: processedLessons, // Use processed lessons with uploaded URLs
        status: courseData.status,
        thumbnail: thumbnailKey, // Send the uploaded file key, not the file
      };

      const response = await apiService.courses.create(coursePayload);

      if (response.success) {
        alert("Course saved as draft successfully!");
        navigate("/teacher-dashboard");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      alert(
        error.response?.data?.message ||
          "Failed to save course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const publishCourse = async () => {
    if (!validateStep(2)) return;

    try {
      setLoading(true);
      const courseDataWithStatus = { ...courseData, status: "pending" };
      await saveDraft();
      alert(
        "Course submitted for review! You'll be notified once it's approved."
      );
      navigate("/teacher-dashboard");
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Failed to publish course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h5"
              sx={{ color: "white", mb: 3, fontWeight: 600 }}
            >
              Basic Course Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Title"
                  value={courseData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="e.g., Complete Guitar Mastery for Beginners"
                  InputProps={{
                    sx: {
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                    },
                  }}
                  InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Course Description"
                  value={courseData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Describe what students will learn in this course..."
                  InputProps={{
                    sx: {
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                    },
                  }}
                  InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Level
                  </InputLabel>
                  <Select
                    value={courseData.level}
                    onChange={(e) => handleInputChange("level", e.target.value)}
                    sx={{
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={courseData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  placeholder="e.g., Guitar, Piano, Music Theory"
                  InputProps={{
                    sx: {
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                    },
                  }}
                  InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h5"
              sx={{ color: "white", mb: 3, fontWeight: 600 }}
            >
              Content & Pricing
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price (USD)"
                  value={courseData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  error={!!errors.price}
                  helperText={errors.price}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PriceIcon sx={{ color: "white" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                    },
                  }}
                  InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
                  >
                    Course Thumbnail
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{
                      height: "56px",
                      borderColor: errors.thumbnail
                        ? "red"
                        : "rgba(255,255,255,0.2)",
                      color: errors.thumbnail ? "red" : "white",
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.5)",
                      },
                    }}
                  >
                    {courseData.thumbnailFile
                      ? courseData.thumbnailFile.name
                      : "Upload Thumbnail"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                    />
                  </Button>
                  {errors.thumbnail && (
                    <Typography
                      variant="caption"
                      sx={{ color: "red", mt: 0.5 }}
                    >
                      {errors.thumbnail}
                    </Typography>
                  )}
                </Box>
              </Grid>
              {courseData.thumbnailUrl && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: "white", mb: 1 }}>
                      Thumbnail Preview:
                    </Typography>
                    <img
                      src={courseData.thumbnailUrl}
                      alt="Thumbnail preview"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "120px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography variant="h5" sx={{ color: "white", mb: 3, fontWeight: 600 }}>Course Lessons</Typography>

            {/* Add New Lesson */}
            <Paper
              elevation={0}
              sx={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
                p: 3,
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                Add New Lesson
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Lesson Title"
                    value={currentLesson.title}
                    onChange={(e) =>
                      setCurrentLesson((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    InputProps={{
                      sx: {
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255,255,255,0.2)",
                        },
                      },
                    }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Duration (minutes)"
                    type="number"
                    value={currentLesson.duration}
                    onChange={(e) =>
                      setCurrentLesson((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    InputProps={{
                      sx: {
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255,255,255,0.2)",
                        },
                      },
                    }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    label="Lesson Description"
                    value={currentLesson.description}
                    onChange={(e) =>
                      setCurrentLesson((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    InputProps={{
                      sx: {
                        background: "rgba(255,255,255,0.05)",
                        color: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(255,255,255,0.2)",
                        },
                      },
                    }}
                    InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
                  />
                </Grid>
                {/* Video Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                    Lesson Video (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCurrentLesson(prev => ({
                          ...prev,
                          videoFile: file
                        }));
                      }
                    }}
                    style={{ display: "none" }}
                    id="lesson-video-upload"
                  />
                  <label htmlFor="lesson-video-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<VideoLibraryIcon />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      {currentLesson.videoFile ? currentLesson.videoFile.name : "Upload Video"}
                    </Button>
                  </label>
                </Grid>

                {/* Multitrack Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                    Multitrack Files (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setCurrentLesson(prev => ({
                        ...prev,
                        multitrackFiles: [...prev.multitrackFiles, ...files]
                      }));
                    }}
                    style={{ display: "none" }}
                    id="lesson-multitrack-upload"
                  />
                  <label htmlFor="lesson-multitrack-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<LibraryMusicIcon />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Add Multitracks
                    </Button>
                  </label>
                  {currentLesson.multitrackFiles.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {currentLesson.multitrackFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setCurrentLesson(prev => ({
                              ...prev,
                              multitrackFiles: prev.multitrackFiles.filter((_, i) => i !== index)
                            }));
                          }}
                          sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.1)" }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>

                {/* PDF Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                    PDF Materials (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setCurrentLesson(prev => ({
                        ...prev,
                        pdfFiles: [...prev.pdfFiles, ...files]
                      }));
                    }}
                    style={{ display: "none" }}
                    id="lesson-pdf-upload"
                  />
                  <label htmlFor="lesson-pdf-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PictureAsPdfIcon />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Add PDFs
                    </Button>
                  </label>
                  {currentLesson.pdfFiles.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {currentLesson.pdfFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setCurrentLesson(prev => ({
                              ...prev,
                              pdfFiles: prev.pdfFiles.filter((_, i) => i !== index)
                            }));
                          }}
                          sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.1)" }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>

                {/* Resource Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                    Additional Resources (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept="*/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setCurrentLesson(prev => ({
                        ...prev,
                        resourceFiles: [...prev.resourceFiles, ...files]
                      }));
                    }}
                    style={{ display: "none" }}
                    id="lesson-resource-upload"
                  />
                  <label htmlFor="lesson-resource-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFileIcon />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Add Resources
                    </Button>
                  </label>
                  {currentLesson.resourceFiles.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {currentLesson.resourceFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setCurrentLesson(prev => ({
                              ...prev,
                              resourceFiles: prev.resourceFiles.filter((_, i) => i !== index)
                            }));
                          }}
                          sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.1)" }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addLesson}
                    disabled={
                      !currentLesson.title || !currentLesson.description
                    }
                    sx={{
                      background: designSystem.colors.success.gradient,
                      "&:hover": {
                        background: designSystem.colors.success.gradient,
                      },
                      "&:disabled": {
                        background: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Add Lesson
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Lessons List */}
            <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
              Course Lessons ({courseData.lessons.length})
            </Typography>
            {errors.lessons && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.lessons}
              </Alert>
            )}
            <Stack spacing={2}>
              {courseData.lessons.map((lesson, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ color: "white", fontWeight: 600 }}
                      >
                        {index + 1}. {lesson.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {lesson.description}
                      </Typography>
                      {lesson.duration && (
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {lesson.duration} minutes
                        </Typography>
                      )}
                      {/* Material Indicators */}
                      <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {lesson.videoFile && (
                          <Chip
                            icon={<VideoLibraryIcon />}
                            label="Video"
                            size="small"
                            sx={{
                              background: "rgba(76, 175, 80, 0.2)",
                              color: "#4CAF50",
                              border: "1px solid rgba(76, 175, 80, 0.3)",
                            }}
                          />
                        )}
                        {lesson.materials?.multitracks?.length > 0 && (
                          <Chip
                            icon={<LibraryMusicIcon />}
                            label={`${lesson.materials.multitracks.length} Multitrack${lesson.materials.multitracks.length > 1 ? "s" : ""}`}
                            size="small"
                            sx={{
                              background: "rgba(156, 39, 176, 0.2)",
                              color: "#9C27B0",
                              border: "1px solid rgba(156, 39, 176, 0.3)",
                            }}
                          />
                        )}
                        {lesson.materials?.pdfs?.length > 0 && (
                          <Chip
                            icon={<PictureAsPdfIcon />}
                            label={`${lesson.materials.pdfs.length} PDF${lesson.materials.pdfs.length > 1 ? "s" : ""}`}
                            size="small"
                            sx={{
                              background: "rgba(244, 67, 54, 0.2)",
                              color: "#F44336",
                              border: "1px solid rgba(244, 67, 54, 0.3)",
                            }}
                          />
                        )}
                        {lesson.materials?.resources?.length > 0 && (
                          <Chip
                            icon={<AttachFileIcon />}
                            label={`${lesson.materials.resources.length} Resource${lesson.materials.resources.length > 1 ? "s" : ""}`}
                            size="small"
                            sx={{
                              background: "rgba(255, 152, 0, 0.2)",
                              color: "#FF9800",
                              border: "1px solid rgba(255, 152, 0, 0.3)",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeLesson(index)}
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        "&:hover": {
                          background: "rgba(255, 107, 107, 0.2)",
                          color: "white",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
            </Box>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h5"
              sx={{ color: "white", mb: 3, fontWeight: 600 }}
            >
              Review & Publish
            </Typography>
            <Card
              elevation={0}
              sx={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
                      {courseData.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}
                    >
                      {courseData.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={courseData.level}
                        size="small"
                        sx={{
                          background: designSystem.colors.primary.gradient,
                          color: "white",
                        }}
                      />
                      <Chip
                        label={courseData.category}
                        size="small"
                        sx={{
                          background: designSystem.colors.secondary.gradient,
                          color: "white",
                        }}
                      />
                      <Chip
                        label={`$${courseData.price}`}
                        size="small"
                        sx={{
                          background: designSystem.colors.warning.gradient,
                          color: "white",
                        }}
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {courseData.lessons.length} lessons
                    </Typography>
                  </Grid>
                  {courseData.thumbnailUrl && (
                    <Grid item xs={12} sm={6}>
                      <img
                        src={courseData.thumbnailUrl}
                        alt="Course thumbnail"
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <Box
        sx={{
          minHeight: "100vh",
          background: designSystem.colors.background.main,
          py: 4,
        }}
      >
        {/* Header */}
        <Box sx={{ px: 4, mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <CourseIcon sx={{ color: "white", fontSize: 32 }} />
            <Typography
              variant="h3"
              sx={{
                color: "white",
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Create New Course
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Share your expertise and create an engaging learning experience
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ px: 4, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": {
                        color: "rgba(255,255,255,0.7)",
                        "&.Mui-active": {
                          color: "white",
                          fontWeight: 600,
                        },
                        "&.Mui-completed": {
                          color: "white",
                        },
                      },
                      "& .MuiStepIcon-root": {
                        color: "rgba(255,255,255,0.3)",
                        "&.Mui-active": {
                          color: "white",
                        },
                        "&.Mui-completed": {
                          color: "#51cf66",
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>

        {/* Content */}
        <Box sx={{ px: 4, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              p: 4,
              minHeight: "500px",
            }}
          >
            {renderStepContent()}
          </Paper>
        </Box>

        {/* Navigation */}
        <Box sx={{ px: 4 }}>
          <Paper
            elevation={0}
            sx={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 2,
              p: 3,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                sx={{ color: "white" }}
              >
                Back
              </Button>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={saveDraft}
                  disabled={loading}
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                    },
                  }}
                >
                  Save Draft
                </Button>

                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    sx={{
                      background: designSystem.colors.primary.gradient,
                      "&:hover": {
                        background: designSystem.colors.primary.gradient,
                      },
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<PublishIcon />}
                    onClick={publishCourse}
                    disabled={loading}
                    sx={{
                      background: designSystem.colors.success.gradient,
                      "&:hover": {
                        background: designSystem.colors.success.gradient,
                      },
                    }}
                  >
                    Submit for Review
                  </Button>
                )}
              </Stack>
            </Stack>

            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress sx={{ borderRadius: 1 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "white", mt: 1, textAlign: "center" }}
                >
                  {activeStep === steps.length - 1
                    ? "Publishing course..."
                    : "Saving..."}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
};

export default CourseCreatePage;
