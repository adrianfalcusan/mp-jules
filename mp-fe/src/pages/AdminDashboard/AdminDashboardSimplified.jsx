import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import {
  People as UsersIcon,
  School as CoursesIcon,
  Analytics as AnalyticsIcon,
  Schedule as PendingIcon,
  AttachMoney as RevenueIcon,
  CheckCircle as ApprovalIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const designSystem = {
  colors: {
    primary: {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    secondary: {
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    success: {
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    warning: {
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  },
};

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  color,
  onClick,
}) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card
      sx={{
        background: color,
        color: "white",
        cursor: "pointer",
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: "center", p: 3 }}>
        <Icon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    users: [],
    courses: [],
    stats: {
      totalUsers: 0,
      totalCourses: 0,
      pendingApprovals: 0,
      totalRevenue: 0,
    },
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate loading - replace with actual API calls
      setTimeout(() => {
        setDashboardData({
          users: [],
          courses: [],
          stats: {
            totalUsers: 4,
            totalCourses: 11,
            pendingApprovals: 7,
            totalRevenue: 0,
          },
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "contentApproval":
        navigate("/admin/approval");
        break;
      case "manageUsers":
        setActiveTab(0);
        break;
      case "viewAnalytics":
        setActiveTab(2);
        break;
      case "viewCourses":
        setActiveTab(1);
        break;
      default:
        console.log(`Action ${action} not implemented yet`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your music platform
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <UsersIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {dashboardData.stats.totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <CoursesIcon
              sx={{ fontSize: 40, color: "secondary.main", mb: 1 }}
            />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {dashboardData.stats.totalCourses}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Courses
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <PendingIcon sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {dashboardData.stats.pendingApprovals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Approvals
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <RevenueIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              ${dashboardData.stats.totalRevenue}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Content Approval"
              description="Review and approve pending courses"
              icon={ApprovalIcon}
              color={designSystem.colors.primary.gradient}
              onClick={() => handleQuickAction("contentApproval")}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Manage Users"
              description="View and manage platform users"
              icon={UsersIcon}
              color={designSystem.colors.secondary.gradient}
              onClick={() => handleQuickAction("manageUsers")}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="View Courses"
              description="Browse all platform courses"
              icon={CoursesIcon}
              color={designSystem.colors.success.gradient}
              onClick={() => handleQuickAction("viewCourses")}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Analytics"
              description="View platform analytics"
              icon={AnalyticsIcon}
              color={designSystem.colors.warning.gradient}
              onClick={() => handleQuickAction("viewAnalytics")}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Content Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Users" />
            <Tab label="Courses" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                User Management
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                User management features will be implemented here.
              </Alert>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Course Management
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Course management features will be implemented here.
              </Alert>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Platform Analytics
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Analytics dashboard will be implemented here.
              </Alert>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
