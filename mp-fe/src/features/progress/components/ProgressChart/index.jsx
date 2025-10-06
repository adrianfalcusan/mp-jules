import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  LinearProgress,
  Stack,
  Card,
  CardContent,
  Chip,
  Grid,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  PlayCircle as PlayCircleIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { designSystem } from "../../../../theme";

const ProgressChart = ({
  userStats,
  recentActivity,
  showRecentActivity = false,
  className,
  ...props
}) => {
  const {
    totalContent = 0,
    completedContent = 0,
    averageProgress = 0,
    totalTimeSpent = 0,
  } = userStats || {};

  const completionRate =
    totalContent > 0 ? (completedContent / totalContent) * 100 : 0;
  const hoursSpent = Math.round((totalTimeSpent / 60) * 10) / 10;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Box className={className} {...props}>
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              elevation={0}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                },
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <TrendingUpIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {Math.round(averageProgress)}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Average Progress
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              elevation={0}
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                },
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <CheckCircleIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {completedContent}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completed
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              elevation={0}
              sx={{
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                color: designSystem.colors.text.primary,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                },
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <PlayCircleIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalContent}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Total Enrolled
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              elevation={0}
              sx={{
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                color: designSystem.colors.text.primary,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                },
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <TimeIcon />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {hoursSpent}h
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Time Spent
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Detailed Progress */}
      <Grid container spacing={3}>
        {/* Overall Progress */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card
              elevation={0}
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${designSystem.colors.surface.border}`,
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: designSystem.colors.text.primary,
                  }}
                >
                  Learning Progress Overview
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {Math.round(completionRate)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={completionRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(255, 255, 255, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Average Progress
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {Math.round(averageProgress)}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={averageProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(255, 255, 255, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Learning Stats */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center", p: 2 }}>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: "#4facfe" }}
                      >
                        {formatTime(totalTimeSpent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Study Time
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center", p: 2 }}>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: "#667eea" }}
                      >
                        {totalContent - completedContent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Activity */}
        {showRecentActivity && (
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card
                elevation={0}
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${designSystem.colors.surface.border}`,
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                      color: designSystem.colors.text.primary,
                    }}
                  >
                    Recent Activity
                  </Typography>

                  {recentActivity && recentActivity.length > 0 ? (
                    <Stack spacing={2}>
                      {recentActivity.slice(0, 5).map((activity, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: "rgba(255, 255, 255, 0.03)",
                            border: `1px solid ${designSystem.colors.surface.border}`,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background:
                                  activity.progressPercentage >= 100
                                    ? "#4facfe"
                                    : "#667eea",
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                              >
                                {activity.contentType === "course"
                                  ? "Course"
                                  : "Tutorial"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {Number.isFinite(activity.progressPercentage)
                                  ? Math.round(activity.progressPercentage)
                                  : 0}
                                % complete
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={`${formatTime(Number.isFinite(activity.timeSpent) ? activity.timeSpent : 0)}`}
                              sx={{
                                background: "rgba(255, 255, 255, 0.1)",
                                color: designSystem.colors.text.secondary,
                                fontSize: "0.7rem",
                              }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <PlayCircleIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Start learning to see your activity here
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

ProgressChart.propTypes = {
  userStats: PropTypes.shape({
    totalContent: PropTypes.number,
    completedContent: PropTypes.number,
    averageProgress: PropTypes.number,
    totalTimeSpent: PropTypes.number,
  }),
  recentActivity: PropTypes.arrayOf(
    PropTypes.shape({
      contentType: PropTypes.string,
      progressPercentage: PropTypes.number,
      timeSpent: PropTypes.number,
    })
  ),
  showRecentActivity: PropTypes.bool,
  className: PropTypes.string,
};

export default ProgressChart;
