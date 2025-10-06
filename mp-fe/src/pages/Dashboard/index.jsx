// src/pages/Dashboard/index.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Stack,
  Container,
  Divider,
  Alert,
} from "@mui/material";
import {
  PlayArrow,
  EmojiEvents,
  AccessTime,
  LocalFireDepartment,
  Person,
  LibraryBooks,
  AutoAwesome,
  Timeline,
  CheckCircle,
  Schedule,
  Assignment,
} from "@mui/icons-material";
import Spinner from "../../components/Spinner";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import theme from "../../theme";
import ENV from "../../config/environment";
import ProgressChart from "../../features/progress/components/ProgressChart";
import AchievementBadge from "../../features/achievements/components/AchievementBadge";
import useProgress from "../../features/progress/hooks/useProgress";
import useAchievements from "../../features/achievements/hooks/useAchievements";
import PropTypes from "prop-types";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Progress tracking
  const { userStats } = useProgress();

  // Achievements
  const { stats: achievementStats, getRecentlyUnlocked } = useAchievements();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ENV.API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: theme.palette.text.primary }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.muted }}
              >
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Chip
                size="small"
                label={trend}
                sx={{
                  mt: 1,
                  background: trend.includes("+") ? "#10b98120" : "#f5970720",
                  color: trend.includes("+") ? "#10b981" : "#f59707",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );

  StatCard.propTypes = {
    icon: PropTypes.node,
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subtitle: PropTypes.string,
    color: PropTypes.string,
    trend: PropTypes.string,
  };

  const ContentCard = ({ item, showProgress = true }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          "&:hover": { boxShadow: `0 20px 40px rgba(99, 102, 241, 0.15)` },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="160"
            image={item.thumbnailUrl || "/img/course-fallback.jpg"}
            alt={item.title}
            sx={{ filter: "brightness(0.9)" }}
          />
          <IconButton
            component={Link}
            to={`/${item.itemType === "course" ? "courses" : "tutorial"}/${item._id}`}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                transform: "translate(-50%, -50%) scale(1.1)",
              },
            }}
          >
            <PlayArrow sx={{ fontSize: 24 }} />
          </IconButton>

          {item.isCompleted && (
            <Chip
              icon={<CheckCircle />}
              label="Completed"
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "#10b981",
                color: "white",
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: theme.palette.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </Typography>

          {showProgress && (
            <Box sx={{ mb: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Progress
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
                >
                  {Math.round(item.progress || 0)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={item.progress || 0}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    background:
                      "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          )}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 24, height: 24 }}>
                <Person sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
                {item.teacher?.name || "Instructor"}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime
                sx={{ fontSize: 16, color: theme.palette.text.muted }}
              />
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.muted }}
              >
                {Math.round(item.timeSpent || 0)}m
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  ContentCard.propTypes = {
    item: PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      thumbnailUrl: PropTypes.string,
      teacher: PropTypes.shape({ name: PropTypes.string }),
      progress: PropTypes.number,
      timeSpent: PropTypes.number,
      itemType: PropTypes.string,
      isCompleted: PropTypes.bool,
    }),
    showProgress: PropTypes.bool,
  };

  const MilestoneCard = ({ milestone }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {milestone.type === "completion" && <Assignment />}
          {milestone.type === "streak" && <LocalFireDepartment />}
          {milestone.type === "time" && <Schedule />}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            {milestone.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            {milestone.description}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mb: 1 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            Progress
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
          >
            {milestone.current}/{milestone.target}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={milestone.progress}
          sx={{
            height: 6,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.1)",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
              borderRadius: 3,
            },
          }}
        />
      </Box>
    </Paper>
  );

  MilestoneCard.propTypes = {
    milestone: PropTypes.shape({
      type: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      current: PropTypes.number,
      target: PropTypes.number,
      progress: PropTypes.number,
    }),
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <Spinner />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        </Container>
      </Layout>
    );
  }

  const {
    overview,
    enrolledContent,
    analytics,
    achievements,
    recommendations,
  } = dashboardData;

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Welcome back, {user?.name || "Student"}!
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: theme.palette.text.secondary }}
            >
              Continue your musical journey and track your progress
            </Typography>
          </Box>

          {/* Overview Statistics */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<LibraryBooks />}
                title="Total Enrolled"
                value={overview.totalEnrolled}
                subtitle={`${overview.totalCourses} courses, ${overview.totalTutorials} tutorials`}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Timeline />}
                title="Avg. Progress"
                value={`${overview.averageProgress}%`}
                subtitle="Across all content"
                color={theme.palette.secondary.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<LocalFireDepartment />}
                title="Learning Streak"
                value={overview.currentStreak}
                subtitle="Days in a row"
                color="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<EmojiEvents />}
                title="Achievements"
                value={overview.totalAchievements}
                subtitle="Unlocked badges"
                color="#10b981"
              />
            </Grid>
          </Grid>

          {/* Recently Accessed Content */}
          {enrolledContent.recentlyAccessed.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                >
                  Continue Learning
                </Typography>
                <Button
                  component={Link}
                  to="/catalog"
                  variant="outlined"
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  }}
                >
                  View All
                </Button>
              </Stack>
              <Grid container spacing={3}>
                {enrolledContent.recentlyAccessed.slice(0, 3).map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item._id}>
                    <ContentCard item={item} showProgress={true} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Progress Tracking */}
          <Box sx={{ mb: 6 }}>
            <ProgressChart userStats={userStats} showRecentActivity={false} />
          </Box>

          {/* Learning Analytics & Achievements */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {/* Recent Achievements */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.primary,
                  }}
                >
                  Recent Achievements
                </Typography>

                <Grid container spacing={2}>
                  {getRecentlyUnlocked(7)
                    .slice(0, 6)
                    .map((achievement, index) => (
                      <Grid item xs={6} key={achievement._id || index}>
                        <AchievementBadge
                          achievement={achievement}
                          userProgress={achievement.userProgress}
                          size="small"
                          showProgress={false}
                        />
                      </Grid>
                    ))}
                  {getRecentlyUnlocked(7).length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: "center", py: 3 }}>
                        <EmojiEvents
                          sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Complete lessons to unlock achievements!
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Analytics */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.primary,
                  }}
                >
                  Achievement Stats
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#4facfe" }}
                      >
                        {achievementStats?.completed || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unlocked
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#667eea" }}
                      >
                        {achievementStats?.totalPoints || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Points
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#f093fb" }}
                      >
                        {Math.round(achievementStats?.completionRate || 0)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#43e97b" }}
                      >
                        {achievementStats?.inProgress || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Continue Learning Section removed (duplicate of Recently Accessed Content above) */}

          {/* Learning Analytics & Milestones */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {/* Analytics */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.primary,
                  }}
                >
                  Learning Analytics
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#10b981", mb: 1 }}
                      >
                        {Math.round(overview.totalTimeSpent)}m
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Time Spent
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#f59e0b", mb: 1 }}
                      >
                        {analytics.sessionStats.totalDays || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Active Days
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#8b5cf6", mb: 1 }}
                      >
                        {Math.round(
                          analytics.sessionStats.averageTimePerDay || 0
                        )}
                        m
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Avg/Day
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Category Distribution */}
                {Object.keys(analytics.categoryStats).length > 0 && (
                  <>
                    <Divider
                      sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.1)" }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: theme.palette.text.primary,
                      }}
                    >
                      Learning Categories
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(analytics.categoryStats).map(
                        ([category, stats]) => (
                          <Grid item xs={6} sm={4} key={category}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                background: "rgba(255, 255, 255, 0.05)",
                                textAlign: "center",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  textTransform: "capitalize",
                                }}
                              >
                                {category}
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                }}
                              >
                                {stats.completed}/{stats.total}
                              </Typography>
                            </Box>
                          </Grid>
                        )
                      )}
                    </Grid>
                  </>
                )}
              </Paper>
            </Grid>

            {/* Next Milestones */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: theme.palette.text.primary,
                  }}
                >
                  Next Milestones
                </Typography>

                <Stack spacing={3}>
                  {achievements.nextMilestones.length > 0 ? (
                    achievements.nextMilestones
                      .slice(0, 3)
                      .map((milestone, index) => (
                        <MilestoneCard key={index} milestone={milestone} />
                      ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        textAlign: "center",
                        py: 4,
                      }}
                    >
                      Great job! You’ve completed your current milestones.
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Achievements */}
          {achievements.recent.length > 0 && (
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                Recent Achievements
              </Typography>
              <Grid container spacing={3}>
                {achievements.recent.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement._id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h4">
                          {achievement.achievement.icon}
                        </Typography>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {achievement.achievement.name}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {achievement.achievement.description}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            Unlocked{" "}
                            {new Date(
                              achievement.unlockedAt
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Recommendations */}
          {(recommendations.courses.length > 0 ||
            recommendations.tutorials.length > 0) && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 3 }}
              >
                <AutoAwesome sx={{ color: theme.palette.secondary.main }} />
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                >
                  Recommended for You
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                {[...recommendations.courses, ...recommendations.tutorials]
                  .slice(0, 6)
                  .map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <ContentCard
                        item={{
                          ...item,
                          itemType: recommendations.courses.includes(item)
                            ? "course"
                            : "tutorial",
                        }}
                        showProgress={false}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}
        </motion.div>
      </Container>
    </Layout>
  );
};

export default Dashboard;
