// src/pages/TeacherDashboard/index.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  School as CoursesIcon,
  LibraryMusic as TutorialsIcon,
  AttachMoney as RevenueIcon,
  People as StudentsIcon,
  VideoLibrary as VideoIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PropTypes from "prop-types";

import Layout from "../../components/Layout";
import { apiService } from "../../services/api";

import TutorialCreator from "../../components/TutorialCreator";
import VideoUploadForm from "../../components/VideoUploadForm";

// Design system
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
    glassmorphism: {
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
  },
};

// Initialize empty analytics - will be populated from real API data
const initialAnalytics = {
  overview: {
    totalCourses: 0,
    totalTutorials: 0,
    totalStudents: 0,
    totalRevenue: 0,
  },
  chartData: [],
};

// Beautiful metric card
const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  gradient,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    <Paper
      elevation={0}
      sx={{
        background: gradient,
        borderRadius: 3,
        p: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: designSystem.colors.glassmorphism.background,
          backdropFilter: designSystem.colors.glassmorphism.backdropFilter,
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255,255,255,0.9)", mb: 1 }}
            >
              {title}
            </Typography>
            {change && (
              <Chip
                label={`+${change}%`}
                size="small"
                sx={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Icon sx={{ fontSize: 32, color: "white" }} />
          </Box>
        </Stack>
      </Box>
    </Paper>
  </motion.div>
);

// Quick action card
const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color,
}) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card
      elevation={0}
      sx={{
        background: designSystem.colors.glassmorphism.background,
        backdropFilter: designSystem.colors.glassmorphism.backdropFilter,
        border: designSystem.colors.glassmorphism.border,
        borderRadius: 3,
        p: 3,
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "rgba(255,255,255,0.08)",
          transform: "translateY(-2px)",
        },
      }}
      onClick={onClick}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: color,
          }}
        >
          <Icon sx={{ color: "white", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </Card>
  </motion.div>
);

// PropTypes for MetricCard
MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.number,
  icon: PropTypes.elementType.isRequired,
  gradient: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

// PropTypes for QuickActionCard
QuickActionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
};

export default function TeacherDashboard() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);

  // Load teacher data
  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      setLoading(true);

      // Load teacher analytics (includes overview metrics and chart data)
      try {
        const analyticsRes = await apiService.teachers.getDashboardAnalytics();
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.analytics);
        }
      } catch (error) {
        console.warn("Teacher analytics API not available:", error);
      }

      // Load teacher's courses
      try {
        const coursesRes = await apiService.teachers.getMyCourses();
        if (coursesRes.success) {
          setCourses(coursesRes.courses);
        }
      } catch (error) {
        console.warn("Teacher courses API not available:", error);
      }

      // Load teacher's tutorials
      try {
        const tutorialsRes = await apiService.teachers.getMyTutorials();
        if (tutorialsRes.success) {
          setTutorials(tutorialsRes.tutorials);
        }
      } catch (error) {
        console.warn("Teacher tutorials API not available:", error);
      }
    } catch (error) {
      console.error("Error loading teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action === "createCourse") {
      navigate("/teacher/create-course");
    } else if (action === "createTutorial") {
      navigate("/create-tutorial");
    } else {
      setSelectedAction(action);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateCourse = () => {
    navigate("/teacher/create-course");
  };

  const handleCreateTutorial = () => {
    navigate("/teacher/create-tutorial");
  };

  if (loading) {
    return (
      <Layout>
        <Box
          sx={{
            minHeight: "100vh",
            background: designSystem.colors.background.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LinearProgress sx={{ width: 200, color: "white" }} />
        </Box>
      </Layout>
    );
  }

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ px: 4, mb: 4 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    mb: 1,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Teacher Studio
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Welcome back, {user?.name}! Create and manage your content
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleQuickAction("quickAdd")}
                sx={{
                  background: designSystem.colors.primary.gradient,
                  py: 1.5,
                  px: 3,
                  borderRadius: 3,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  "&:hover": {
                    background: designSystem.colors.primary.gradient,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Create Content
              </Button>
            </Stack>
          </Box>
        </motion.div>

        {/* Metrics Overview */}
        <Box sx={{ px: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Total Courses"
                value={analytics.overview.totalCourses}
                change={8.5}
                icon={CoursesIcon}
                gradient={designSystem.colors.primary.gradient}
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Tutorials"
                value={analytics.overview.totalTutorials}
                change={12.3}
                icon={TutorialsIcon}
                gradient={designSystem.colors.secondary.gradient}
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Total Students"
                value={analytics.overview.totalStudents}
                change={15.7}
                icon={StudentsIcon}
                gradient={designSystem.colors.success.gradient}
                delay={0.3}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Revenue"
                value={`$${analytics.overview.totalRevenue.toLocaleString()}`}
                change={23.1}
                icon={RevenueIcon}
                gradient={designSystem.colors.warning.gradient}
                delay={0.4}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ px: 4, mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Typography
              variant="h5"
              sx={{ color: "white", fontWeight: 600, mb: 3 }}
            >
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Create Course"
                  description="Design a comprehensive learning path"
                  icon={CoursesIcon}
                  color={designSystem.colors.primary.gradient}
                  onClick={() => handleQuickAction("createCourse")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Create Tutorial"
                  description="Upload single lesson with multitrack"
                  icon={TutorialsIcon}
                  color={designSystem.colors.secondary.gradient}
                  onClick={() => handleQuickAction("createTutorial")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Upload Video"
                  description="Add content to existing courses"
                  icon={VideoIcon}
                  color={designSystem.colors.success.gradient}
                  onClick={() => handleQuickAction("uploadVideo")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="View Analytics"
                  description="Track your content performance"
                  icon={AnalyticsIcon}
                  color={designSystem.colors.warning.gradient}
                  onClick={() => setActiveTab(2)}
                />
              </Grid>
            </Grid>
          </motion.div>
        </Box>

        {/* Content Management */}
        <Box sx={{ px: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Paper
              elevation={0}
              sx={{
                background: designSystem.colors.glassmorphism.background,
                backdropFilter:
                  designSystem.colors.glassmorphism.backdropFilter,
                border: designSystem.colors.glassmorphism.border,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  "& .MuiTab-root": {
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 600,
                    "&.Mui-selected": {
                      color: "white",
                    },
                  },
                  "& .MuiTabs-indicator": {
                    background: designSystem.colors.primary.gradient,
                    height: 3,
                  },
                }}
              >
                <Tab label="My Courses" />
                <Tab label="My Tutorials" />
                <Tab label="Analytics" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="h6" sx={{ color: "white" }}>
                        My Courses ({courses.length})
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          placeholder="Search courses..."
                          size="small"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon
                                  sx={{ color: "rgba(255,255,255,0.5)" }}
                                />
                              </InputAdornment>
                            ),
                            sx: {
                              background: "rgba(255,255,255,0.05)",
                              color: "white",
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "1px solid rgba(255,255,255,0.2)",
                              },
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => navigate("/teacher/create-course")}
                          sx={{
                            background: designSystem.colors.primary.gradient,
                            "&:hover": {
                              background: designSystem.colors.primary.gradient,
                            },
                          }}
                        >
                          New Course
                        </Button>
                      </Stack>
                    </Stack>

                    {courses.length > 0 ? (
                      <Grid container spacing={3}>
                        {courses
                          .filter((course) =>
                            course.title
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          )
                          .map((course) => (
                            <Grid item xs={12} sm={6} md={4} key={course._id}>
                              <Card
                                elevation={0}
                                sx={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: 2,
                                  "&:hover": {
                                    background: "rgba(255,255,255,0.08)",
                                  },
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height="140"
                                  image={
                                    course.thumbnailUrl ||
                                    "/api/placeholder/300/140"
                                  }
                                  alt={course.title}
                                  sx={{ objectFit: "cover" }}
                                />
                                <CardContent>
                                  <Typography
                                    variant="h6"
                                    sx={{ color: "white", mb: 1 }}
                                  >
                                    {course.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "rgba(255,255,255,0.7)",
                                      mb: 2,
                                    }}
                                  >
                                    {course.description?.substring(0, 100)}...
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ mb: 2 }}
                                  >
                                    <Chip
                                      label={`$${course.price}`}
                                      size="small"
                                      sx={{
                                        background:
                                          designSystem.colors.warning.gradient,
                                        color: "white",
                                      }}
                                    />
                                    <Chip
                                      label={`${course.enrollmentCount || 0} students`}
                                      size="small"
                                      sx={{
                                        background:
                                          designSystem.colors.success.gradient,
                                        color: "white",
                                      }}
                                    />
                                  </Stack>
                                  <Stack direction="row" spacing={1}>
                                    <IconButton
                                      size="small"
                                      sx={{ color: "rgba(255,255,255,0.7)" }}
                                    >
                                      <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      sx={{ color: "rgba(255,255,255,0.7)" }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      sx={{ color: "rgba(255,255,255,0.7)" }}
                                    >
                                      <MoreIcon />
                                    </IconButton>
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    ) : (
                      <Alert
                        severity="info"
                        sx={{
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.3)",
                          color: "white",
                        }}
                      >
                        You haven't created any courses yet. Start by clicking
                        "New Course" above!
                      </Alert>
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="h6" sx={{ color: "white" }}>
                        My Tutorials ({tutorials.length})
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleQuickAction("createTutorial")}
                        sx={{
                          background: designSystem.colors.secondary.gradient,
                          "&:hover": {
                            background: designSystem.colors.secondary.gradient,
                          },
                        }}
                      >
                        New Tutorial
                      </Button>
                    </Stack>

                    {tutorials.length > 0 ? (
                      <Alert
                        severity="info"
                        sx={{
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.3)",
                          color: "white",
                        }}
                      >
                        Tutorial management interface coming soon. For now, use
                        the "New Tutorial" button above.
                      </Alert>
                    ) : (
                      <Alert
                        severity="info"
                        sx={{
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.3)",
                          color: "white",
                        }}
                      >
                        You haven't created any tutorials yet. Start by clicking
                        "New Tutorial" above!
                      </Alert>
                    )}
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
                      Your Performance Analytics
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} lg={8}>
                        <Paper
                          elevation={0}
                          sx={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            p: 3,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ color: "white", mb: 3 }}
                          >
                            Student Growth & Revenue
                          </Typography>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics.chartData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                              />
                              <XAxis
                                dataKey="month"
                                stroke="rgba(255,255,255,0.7)"
                              />
                              <YAxis stroke="rgba(255,255,255,0.7)" />
                              <Tooltip
                                contentStyle={{
                                  background: "rgba(0,0,0,0.8)",
                                  border: "1px solid rgba(255,255,255,0.2)",
                                  borderRadius: "8px",
                                  color: "white",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="students"
                                stroke="#667eea"
                                strokeWidth={3}
                                dot={{ fill: "#667eea", strokeWidth: 2, r: 6 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#f093fb"
                                strokeWidth={3}
                                dot={{ fill: "#f093fb", strokeWidth: 2, r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} lg={4}>
                        <Paper
                          elevation={0}
                          sx={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            p: 3,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ color: "white", mb: 3 }}
                          >
                            Top Performing Content
                          </Typography>
                          {courses.length > 0 ? (
                            <Stack spacing={2}>
                              {courses.slice(0, 3).map((course, index) => (
                                <Box
                                  key={course._id}
                                  sx={{
                                    p: 2,
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: 2,
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                  >
                                    <Chip
                                      label={`#${index + 1}`}
                                      size="small"
                                      sx={{
                                        background:
                                          designSystem.colors.primary.gradient,
                                        color: "white",
                                      }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: "white", fontWeight: 600 }}
                                      >
                                        {course.title}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "rgba(255,255,255,0.7)" }}
                                      >
                                        {course.enrollmentCount || 0} students
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                              No courses to analyze yet
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Box>

        {/* Quick Action Dialog */}
        <Dialog
          open={Boolean(selectedAction)}
          onClose={() => setSelectedAction(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: designSystem.colors.glassmorphism.background,
              backdropFilter: designSystem.colors.glassmorphism.backdropFilter,
              border: designSystem.colors.glassmorphism.border,
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ color: "white" }}>
            {selectedAction === "uploadVideo" && "Upload Video Content"}
            {selectedAction === "quickAdd" && "Create Content"}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedAction === "uploadVideo" && <VideoUploadForm />}
            {selectedAction === "quickAdd" && (
              <Box>
                <Typography sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}>
                  What would you like to create?
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<CoursesIcon />}
                    onClick={() => setSelectedAction("createCourse")}
                    sx={{
                      color: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      justifyContent: "flex-start",
                      py: 2,
                    }}
                  >
                    <Box sx={{ textAlign: "left", ml: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Create Course
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Multi-lesson learning path
                      </Typography>
                    </Box>
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TutorialsIcon />}
                    onClick={() => setSelectedAction("createTutorial")}
                    sx={{
                      color: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      justifyContent: "flex-start",
                      py: 2,
                    }}
                  >
                    <Box sx={{ textAlign: "left", ml: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Create Tutorial
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Single lesson with multitrack audio
                      </Typography>
                    </Box>
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<VideoIcon />}
                    onClick={() => setSelectedAction("uploadVideo")}
                    sx={{
                      color: "white",
                      borderColor: "rgba(255,255,255,0.3)",
                      justifyContent: "flex-start",
                      py: 2,
                    }}
                  >
                    <Box sx={{ textAlign: "left", ml: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Upload Video
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Add content to existing courses
                      </Typography>
                    </Box>
                  </Button>
                </Stack>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSelectedAction(null)}
              sx={{ color: "white" }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
