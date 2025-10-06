// src/pages/AdminDashboard/index.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Avatar,
  Stack,
  Card,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  CardContent,
} from "@mui/material";
import {
  People as UsersIcon,
  School as CoursesIcon,
  LibraryMusic as TutorialsIcon,
  AttachMoney as RevenueIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  MusicNote as MusicIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Analytics as AnalyticsIcon,
  PersonRemove as PersonRemoveIcon,
  Schedule as PendingIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import Layout from "../../components/Layout";
import { apiService } from "../../services/api";

// Import the original working forms
import CourseCreateForm from "../../components/CourseCreateForm";
import TutorialFullForm from "../../components/TutorialFullForm";
import EnrollForm from "../../components/EnrollForm";

// Design system (matching the rest of the website)
const designSystem = {
  colors: {
    primary: {
      main: "#667eea",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      light: "rgba(102, 126, 234, 0.1)",
    },
    secondary: {
      main: "#f093fb",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      light: "rgba(240, 147, 251, 0.1)",
    },
    success: {
      main: "#51cf66",
      gradient: "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
      light: "rgba(81, 207, 102, 0.1)",
    },
    warning: {
      main: "#ffd93d",
      gradient: "linear-gradient(135deg, #ffd93d 0%, #ff9500 100%)",
      light: "rgba(255, 217, 61, 0.1)",
    },
    background: {
      main: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      paper: "rgba(255, 255, 255, 0.05)",
      glass: "rgba(255, 255, 255, 0.1)",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.8)",
      muted: "rgba(255, 255, 255, 0.6)",
    },
  },
  glassmorphism: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
};

// Initialize empty analytics - will be populated from real API data
const initialAnalytics = {
  overview: {
    totalUsers: 0,
    totalCourses: 0,
    totalTutorials: 0,
    totalRevenue: 0,
    growthRate: 0,
  },
  chartData: [],
  userTypes: [],
};

// Beautiful animated metric card
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
          background: designSystem.glassmorphism.background,
          backdropFilter: designSystem.glassmorphism.backdropFilter,
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
            <Chip
              label={`+${change}%`}
              size="small"
              sx={{
                background: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
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
        background: designSystem.glassmorphism.background,
        backdropFilter: designSystem.glassmorphism.backdropFilter,
        border: designSystem.glassmorphism.border,
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

// Main Dashboard Component
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);

  // Load data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load real analytics data
      try {
        const analyticsRes = await apiService.admin.getAnalytics();
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.analytics);
        }
      } catch (error) {
        console.warn("Analytics API not available:", error);
        // Keep using initial data if API fails
      }

      // Load users
      try {
        const usersRes = await apiService.admin.getUsers();
        if (usersRes.success) {
          setUsers(usersRes.users);
        }
      } catch (error) {
        console.warn("Users API not available:", error);
      }

      // Load courses
      try {
        const coursesRes = await apiService.admin.getCourses();
        if (coursesRes.success) {
          setCourses(coursesRes.courses);
        }
      } catch (error) {
        console.warn("Courses API not available:", error);
      }

      // Load tutorials
      try {
        const tutorialsRes = await apiService.admin.getTutorials();
        if (tutorialsRes.success) {
          setTutorials(tutorialsRes.tutorials);
        }
      } catch (error) {
        console.warn("Tutorials API not available:", error);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action === "contentApproval") {
      navigate("/admin/approval");
    } else if (action === "manageUsers") {
      setActiveTab(0); // Switch to Users tab
    } else if (action === "viewAnalytics") {
      setActiveTab(4); // Switch to Analytics tab
    } else if (action === "viewCourses") {
      setActiveTab(1); // Switch to Courses tab
    } else {
      setSelectedAction(action);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // User management functions
  const handleEditUser = async (user) => {
    try {
      // For now, just show it's implemented - you can add a proper edit dialog
      const newName = prompt("Enter new name:", user.name);
      const newEmail = prompt("Enter new email:", user.email);

      if (newName && newEmail) {
        const result = await apiService.admin.updateUser(user._id, {
          name: newName,
          email: newEmail,
          role: user.role,
        });

        if (result.success) {
          setUsers((prev) =>
            prev.map((u) =>
              u._id === user._id ? { ...u, name: newName, email: newEmail } : u
            )
          );
          console.log("User updated successfully");
        }
      }
    } catch (error) {
      console.error("Error editing user:", error);
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this user? This action cannot be undone."
        )
      ) {
        const result = await apiService.admin.deleteUser(userId);
        if (result.success) {
          setUsers((prev) => prev.filter((user) => user._id !== userId));
          console.log("User deleted successfully");
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const handleSuspendUser = async (userId, suspend) => {
    try {
      const result = await apiService.admin.suspendUser(userId, suspend);
      if (result.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, isActive: !suspend, suspended: suspend }
              : user
          )
        );
        console.log(`User ${suspend ? "suspended" : "activated"} successfully`);
      }
    } catch (error) {
      console.error("Error updating user suspension:", error);
      alert("Error updating user status");
    }
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
          <CircularProgress size={60} sx={{ color: "white" }} />
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
                  Admin Dashboard
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Manage your music platform with ease
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <IconButton
                  sx={{
                    background: designSystem.glassmorphism.background,
                    backdropFilter: designSystem.glassmorphism.backdropFilter,
                    border: designSystem.glassmorphism.border,
                    color: "white",
                  }}
                >
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  sx={{
                    background: designSystem.glassmorphism.background,
                    backdropFilter: designSystem.glassmorphism.backdropFilter,
                    border: designSystem.glassmorphism.border,
                    color: "white",
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        </motion.div>

        {/* Metrics Overview */}
        <Box sx={{ px: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Total Users"
                value={analytics?.overview?.totalUsers || 0}
                change={analytics?.overview?.growthRate || 0}
                icon={UsersIcon}
                gradient={designSystem.colors.primary.gradient}
                delay={0.1}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Courses"
                value={analytics?.overview?.totalCourses || 0}
                change={8.2}
                icon={CoursesIcon}
                gradient={designSystem.colors.secondary.gradient}
                delay={0.2}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Tutorials"
                value={analytics?.overview?.totalTutorials || 0}
                change={15.7}
                icon={TutorialsIcon}
                gradient={designSystem.colors.success.gradient}
                delay={0.3}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                title="Revenue"
                value={`$${(analytics?.overview?.totalRevenue || 0).toLocaleString()}`}
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
              <Grid item xs={12} sm={6} md={4}>
                <QuickActionCard
                  title="Manage Users"
                  description="View and manage platform users"
                  icon={UsersIcon}
                  color={designSystem.colors.primary.gradient}
                  onClick={() => handleQuickAction("manageUsers")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <QuickActionCard
                  title="View Analytics"
                  description="Check platform performance metrics"
                  icon={AnalyticsIcon}
                  color={designSystem.colors.secondary.gradient}
                  onClick={() => handleQuickAction("viewAnalytics")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <QuickActionCard
                  title="Add User"
                  description="Invite new users to the platform"
                  icon={PersonAddIcon}
                  color={designSystem.colors.success.gradient}
                  onClick={() => handleQuickAction("addUser")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <QuickActionCard
                  title="Content Approval"
                  description="Review and approve pending courses"
                  icon={PendingIcon}
                  color={designSystem.colors.warning.gradient}
                  onClick={() => handleQuickAction("contentApproval")}
                />
              </Grid>
            </Grid>
          </motion.div>
        </Box>

        {/* Analytics Charts */}
        <Box sx={{ px: 4, mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Grid container spacing={3}>
              {/* Revenue Chart */}
              <Grid item xs={12} lg={8}>
                <Paper
                  elevation={0}
                  sx={{
                    background: designSystem.glassmorphism.background,
                    backdropFilter: designSystem.glassmorphism.backdropFilter,
                    border: designSystem.glassmorphism.border,
                    borderRadius: 3,
                    p: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
                    Revenue & User Growth
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.chartData || []}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
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
                        dataKey="revenue"
                        stroke="#667eea"
                        strokeWidth={3}
                        dot={{ fill: "#667eea", strokeWidth: 2, r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#f093fb"
                        strokeWidth={3}
                        dot={{ fill: "#f093fb", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* User Distribution */}
              <Grid item xs={12} lg={4}>
                <Paper
                  elevation={0}
                  sx={{
                    background: designSystem.glassmorphism.background,
                    backdropFilter: designSystem.glassmorphism.backdropFilter,
                    border: designSystem.glassmorphism.border,
                    borderRadius: 3,
                    p: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
                    User Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.userTypes || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(analytics?.userTypes || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {(analytics?.userTypes || []).map((type, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: type.color,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.8)" }}
                          >
                            {type.name}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{ color: "white", fontWeight: 600 }}
                        >
                          {type.value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        </Box>

        {/* Management Tabs */}
        <Box sx={{ px: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Paper
              elevation={0}
              sx={{
                background: designSystem.glassmorphism.background,
                backdropFilter: designSystem.glassmorphism.backdropFilter,
                border: designSystem.glassmorphism.border,
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
                <Tab label="Users" />
                <Tab label="Courses" />
                <Tab label="Tutorials" />
                <Tab label="Content Approval" />
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
                        User Management ({users.length})
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          placeholder="Search users..."
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
                          onClick={() => handleQuickAction("addUser")}
                          sx={{
                            background: designSystem.colors.success.gradient,
                            "&:hover": {
                              background: designSystem.colors.success.gradient,
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          Add User
                        </Button>
                      </Stack>
                    </Stack>

                    {users.length > 0 ? (
                      <TableContainer
                        component={Paper}
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 2,
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sx={{ color: "white", fontWeight: 600 }}
                              >
                                User
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", fontWeight: 600 }}
                              >
                                Role
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", fontWeight: 600 }}
                              >
                                Status
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", fontWeight: 600 }}
                              >
                                Joined
                              </TableCell>
                              <TableCell
                                sx={{ color: "white", fontWeight: 600 }}
                              >
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {users
                              .filter(
                                (user) =>
                                  user.name
                                    ?.toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                  user.email
                                    ?.toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                              )
                              .slice(0, 10)
                              .map((user) => (
                                <TableRow key={user._id || user.id}>
                                  <TableCell>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={2}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          background:
                                            designSystem.colors.primary
                                              .gradient,
                                        }}
                                      >
                                        {user.name?.charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "white",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {user.name}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "rgba(255,255,255,0.7)",
                                          }}
                                        >
                                          {user.email}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={user.role}
                                      size="small"
                                      sx={{
                                        background:
                                          user.role === "admin"
                                            ? designSystem.colors.warning
                                                .gradient
                                            : user.role === "teacher"
                                              ? designSystem.colors.secondary
                                                  .gradient
                                              : designSystem.colors.primary
                                                  .gradient,
                                        color: "white",
                                        fontWeight: 600,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={
                                        user.isActive !== false
                                          ? "Active"
                                          : "Suspended"
                                      }
                                      size="small"
                                      sx={{
                                        background:
                                          user.isActive !== false
                                            ? designSystem.colors.success
                                                .gradient
                                            : "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                                        color: "white",
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "rgba(255,255,255,0.7)" }}
                                    >
                                      {user.createdAt
                                        ? new Date(
                                            user.createdAt
                                          ).toLocaleDateString()
                                        : "Unknown"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Stack direction="row" spacing={1}>
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: "rgba(255,255,255,0.7)",
                                          "&:hover": {
                                            background:
                                              "rgba(102, 126, 234, 0.2)",
                                            color: "white",
                                          },
                                        }}
                                        onClick={() => handleEditUser(user)}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: "rgba(255,255,255,0.7)",
                                          "&:hover": {
                                            background:
                                              user.isActive !== false
                                                ? "rgba(255, 107, 107, 0.2)"
                                                : "rgba(81, 207, 102, 0.2)",
                                            color: "white",
                                          },
                                        }}
                                        onClick={() =>
                                          handleSuspendUser(
                                            user._id,
                                            user.isActive !== false
                                          )
                                        }
                                      >
                                        {user.isActive !== false ? (
                                          <PersonRemoveIcon fontSize="small" />
                                        ) : (
                                          <PersonAddIcon fontSize="small" />
                                        )}
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: "rgba(255,255,255,0.7)",
                                          "&:hover": {
                                            background: "rgba(255,255,255,0.1)",
                                            color: "white",
                                          },
                                        }}
                                      >
                                        <MoreIcon fontSize="small" />
                                      </IconButton>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert
                        severity="info"
                        sx={{
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.3)",
                          color: "white",
                        }}
                      >
                        No users found. Users will appear here as they sign up.
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
                        Course Management
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => handleQuickAction("viewCourses")}
                        sx={{
                          background: designSystem.colors.primary.gradient,
                          "&:hover": {
                            background: designSystem.colors.primary.gradient,
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        View All Courses
                      </Button>
                    </Stack>

                    {courses.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sx={{
                                  color: "rgba(255,255,255,0.8)",
                                  borderColor: "rgba(255,255,255,0.1)",
                                }}
                              >
                                Course
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "rgba(255,255,255,0.8)",
                                  borderColor: "rgba(255,255,255,0.1)",
                                }}
                              >
                                Price
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "rgba(255,255,255,0.8)",
                                  borderColor: "rgba(255,255,255,0.1)",
                                }}
                              >
                                Students
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "rgba(255,255,255,0.8)",
                                  borderColor: "rgba(255,255,255,0.1)",
                                }}
                              >
                                Status
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "rgba(255,255,255,0.8)",
                                  borderColor: "rgba(255,255,255,0.1)",
                                }}
                              >
                                Actions
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {courses.slice(0, 10).map((course, index) => (
                              <TableRow key={course._id || index}>
                                <TableCell
                                  sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "white", fontWeight: 600 }}
                                  >
                                    {course.title || "Untitled Course"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "rgba(255,255,255,0.6)" }}
                                  >
                                    {course.description?.substring(0, 50) ||
                                      "No description"}
                                    ...
                                  </Typography>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: "rgba(255,255,255,0.8)",
                                    borderColor: "rgba(255,255,255,0.1)",
                                  }}
                                >
                                  ${course.price || 0}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: "rgba(255,255,255,0.8)",
                                    borderColor: "rgba(255,255,255,0.1)",
                                  }}
                                >
                                  {course.enrollmentCount || 0}
                                </TableCell>
                                <TableCell
                                  sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                                >
                                  <Chip
                                    label={
                                      course.isPublished ? "Published" : "Draft"
                                    }
                                    size="small"
                                    sx={{
                                      background: course.isPublished
                                        ? designSystem.colors.success.gradient
                                        : designSystem.colors.warning.gradient,
                                      color: "white",
                                    }}
                                  />
                                </TableCell>
                                <TableCell
                                  sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                                >
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
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert
                        severity="info"
                        sx={{
                          background: "rgba(102, 126, 234, 0.1)",
                          border: "1px solid rgba(102, 126, 234, 0.3)",
                          color: "white",
                        }}
                      >
                        No courses found. Create your first course using the
                        button above.
                      </Alert>
                    )}
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="h6" sx={{ color: "white" }}>
                        Tutorial Management
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleQuickAction("createTutorial")}
                        sx={{
                          background: designSystem.colors.secondary.gradient,
                          "&:hover": {
                            background: designSystem.colors.secondary.gradient,
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        Create Tutorial
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
                        Tutorial list will be implemented. For now, use the
                        Create Tutorial button above.
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
                        No tutorials found. Create your first tutorial using the
                        button above.
                      </Alert>
                    )}
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box>
                    <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
                      Content Approval
                    </Typography>

                    <Alert
                      severity="info"
                      sx={{
                        background: "rgba(102, 126, 234, 0.1)",
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                        color: "white",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        🔍 Content Moderation System
                      </Typography>
                      <Typography variant="body2">
                        Review and approve courses and tutorials before they go
                        live. Ensure quality and appropriateness of all content.
                      </Typography>
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
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
                            sx={{ color: "white", mb: 2 }}
                          >
                            📚 Pending Courses
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}
                          >
                            Courses awaiting approval
                          </Typography>
                          <Box sx={{ textAlign: "center", py: 4 }}>
                            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                              No courses pending approval
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} md={6}>
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
                            sx={{ color: "white", mb: 2 }}
                          >
                            🎵 Pending Tutorials
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}
                          >
                            Tutorials awaiting approval
                          </Typography>
                          <Box sx={{ textAlign: "center", py: 4 }}>
                            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                              No tutorials pending approval
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      <Grid item xs={12}>
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
                            sx={{ color: "white", mb: 2 }}
                          >
                            ⚡ Quick Actions
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="contained"
                              sx={{
                                background:
                                  designSystem.colors.success.gradient,
                                "&:hover": {
                                  background:
                                    designSystem.colors.success.gradient,
                                },
                              }}
                            >
                              Approve All Valid Content
                            </Button>
                            <Button
                              variant="outlined"
                              sx={{
                                borderColor: "rgba(255,255,255,0.3)",
                                color: "white",
                              }}
                            >
                              View Rejected Content
                            </Button>
                            <Button
                              variant="outlined"
                              sx={{
                                borderColor: "rgba(255,255,255,0.3)",
                                color: "white",
                              }}
                            >
                              Content Guidelines
                            </Button>
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {activeTab === 4 && (
                  <Box>
                    <Typography variant="h6" sx={{ color: "white", mb: 3 }}>
                      Advanced Analytics
                    </Typography>
                    <Alert
                      severity="info"
                      sx={{
                        background: "rgba(102, 126, 234, 0.1)",
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                        color: "white",
                      }}
                    >
                      Advanced analytics dashboard coming soon. Basic metrics
                      shown above.
                    </Alert>
                  </Box>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Box>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            background: designSystem.colors.primary.gradient,
            "&:hover": {
              background: designSystem.colors.primary.gradient,
              transform: "scale(1.05)",
            },
          }}
          onClick={() => handleQuickAction("quickAdd")}
        >
          <AddIcon />
        </Fab>

        {/* Quick Action Dialog */}
        <Dialog
          open={Boolean(selectedAction)}
          onClose={() => setSelectedAction(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 3,
              maxHeight: "90vh",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              color: "white",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {selectedAction === "createCourse" && "Create New Course"}
            {selectedAction === "createTutorial" && "Create New Tutorial"}
            {selectedAction === "addUser" && "Add New User"}
            {selectedAction === "quickAdd" && "Quick Actions"}
          </DialogTitle>
          <DialogContent
            sx={{
              pt: 3,
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              color: "white",
              maxHeight: "70vh",
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255,255,255,0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "4px",
              },
            }}
          >
            {selectedAction === "createCourse" && (
              <Box sx={{ p: 2 }}>
                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    background: "rgba(102, 126, 234, 0.1)",
                    color: "white",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    🎯 Best Practice: Use Dedicated Course Creator
                  </Typography>
                  <Typography variant="body2">
                    For the best experience, we recommend using the dedicated
                    course creation page. This dialog is for quick actions only.
                  </Typography>
                </Alert>
                <Box
                  sx={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 2,
                    p: 3,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <CourseCreateForm />
                </Box>
              </Box>
            )}
            {selectedAction === "createTutorial" && (
              <Box sx={{ p: 2 }}>
                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    background: "rgba(102, 126, 234, 0.1)",
                    color: "white",
                    border: "1px solid rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    🎵 Tutorial Creation
                  </Typography>
                  <Typography variant="body2">
                    Create a single lesson with multitrack audio support.
                    Perfect for individual songs or techniques.
                  </Typography>
                </Alert>
                <Box
                  sx={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 2,
                    p: 3,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <TutorialFullForm />
                </Box>
              </Box>
            )}
            {selectedAction === "addUser" && (
              <Box sx={{ p: 2 }}>
                <Alert
                  severity="warning"
                  sx={{
                    mb: 3,
                    background: "rgba(245, 158, 11, 0.1)",
                    color: "white",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    ⚠️ Manual User Creation
                  </Typography>
                  <Typography variant="body2">
                    Users typically sign up themselves. Manual creation should
                    be used sparingly for special accounts.
                  </Typography>
                </Alert>
                <Box
                  sx={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 2,
                    p: 3,
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <EnrollForm />
                </Box>
              </Box>
            )}
            {selectedAction === "quickAdd" && (
              <Box sx={{ p: 2 }}>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    mb: 3,
                    fontSize: "1.1rem",
                  }}
                >
                  What would you like to create?
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "rgba(255,255,255,0.08)",
                          transform: "translateY(-2px)",
                          border: "1px solid rgba(102, 126, 234, 0.3)",
                        },
                      }}
                      onClick={() => setSelectedAction("createCourse")}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: designSystem.colors.primary.gradient,
                            }}
                          >
                            <CoursesIcon
                              sx={{ color: "white", fontSize: 32 }}
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ color: "white", fontWeight: 600, mb: 1 }}
                            >
                              Create Course
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              Multi-lesson comprehensive learning path with
                              structured curriculum
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "rgba(255,255,255,0.08)",
                          transform: "translateY(-2px)",
                          border: "1px solid rgba(240, 147, 251, 0.3)",
                        },
                      }}
                      onClick={() => setSelectedAction("createTutorial")}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background:
                                designSystem.colors.secondary.gradient,
                            }}
                          >
                            <TutorialsIcon
                              sx={{ color: "white", fontSize: 32 }}
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ color: "white", fontWeight: 600, mb: 1 }}
                            >
                              Create Tutorial
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              Single lesson with multitrack audio and
                              interactive features
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "rgba(255,255,255,0.08)",
                          transform: "translateY(-2px)",
                          border: "1px solid rgba(81, 207, 102, 0.3)",
                        },
                      }}
                      onClick={() => setSelectedAction("addUser")}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: designSystem.colors.success.gradient,
                            }}
                          >
                            <PersonAddIcon
                              sx={{ color: "white", fontSize: 32 }}
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ color: "white", fontWeight: 600, mb: 1 }}
                            >
                              Add User
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              Manually create user accounts or enroll users to
                              courses
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card
                      elevation={0}
                      sx={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "rgba(255,255,255,0.08)",
                          transform: "translateY(-2px)",
                          border: "1px solid rgba(255, 217, 61, 0.3)",
                        },
                      }}
                      onClick={() => {
                        setSelectedAction(null);
                        setActiveTab(3); // Switch to analytics tab
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background:
                                "linear-gradient(135deg, #ffd93d 0%, #ff9500 100%)",
                            }}
                          >
                            <AnalyticsIcon
                              sx={{ color: "white", fontSize: 32 }}
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ color: "white", fontWeight: 600, mb: 1 }}
                            >
                              View Analytics
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              Platform performance, user activity, and revenue
                              insights
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              p: 2,
            }}
          >
            <Button
              onClick={() => setSelectedAction(null)}
              sx={{
                color: "white",
                "&:hover": {
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Close
            </Button>
            {(selectedAction === "createCourse" ||
              selectedAction === "createTutorial") && (
              <Button
                variant="contained"
                sx={{
                  background: designSystem.colors.primary.gradient,
                  "&:hover": {
                    background: designSystem.colors.primary.gradient,
                    transform: "translateY(-1px)",
                  },
                }}
                onClick={() => {
                  // Here you could navigate to dedicated creation pages
                  setSelectedAction(null);
                }}
              >
                Open in Full Editor
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
