import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  LocalFireDepartment as FireIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { designSystem } from "../../../../theme";

const AchievementBadge = ({
  achievement,
  userProgress,
  size = "medium",
  showProgress = true,
  onClick,
  className,
}) => {
  const {
    name,
    description,
    icon = "🏆",
    category,
    criteria,
    points = 10,
    isActive = true,
  } = achievement || {};

  const { progress = 0, isCompleted = false, unlockedAt } = userProgress || {};

  const progressPercentage = Math.min(100, (progress / criteria?.value) * 100);

  // Size configurations
  const sizeConfig = {
    small: {
      width: 80,
      height: 80,
      iconSize: 24,
      typography: "body2",
      padding: 1,
    },
    medium: {
      width: 120,
      height: 120,
      iconSize: 32,
      typography: "h6",
      padding: 2,
    },
    large: {
      width: 160,
      height: 160,
      iconSize: 48,
      typography: "h5",
      padding: 3,
    },
  };

  const config = sizeConfig[size];

  // Category icons and colors
  const getCategoryIcon = (category) => {
    switch (category) {
      case "progress":
        return <TrophyIcon sx={{ fontSize: config.iconSize }} />;
      case "streak":
        return <FireIcon sx={{ fontSize: config.iconSize }} />;
      case "completion":
        return <StarIcon sx={{ fontSize: config.iconSize }} />;
      case "time":
        return <TimeIcon sx={{ fontSize: config.iconSize }} />;
      case "social":
        return <GroupIcon sx={{ fontSize: config.iconSize }} />;
      default:
        return <SchoolIcon sx={{ fontSize: config.iconSize }} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "progress":
        return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      case "streak":
        return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
      case "completion":
        return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
      case "time":
        return "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)";
      case "social":
        return "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
      default:
        return "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
    }
  };

  const formatUnlockedDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isCompleted
              ? `Unlocked ${formatUnlockedDate(unlockedAt)}`
              : `Progress: ${Math.round(progressPercentage)}%`}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
            Worth {points} points
          </Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: size === "small" ? 1.05 : 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={onClick}
        className={className}
      >
        <Card
          elevation={0}
          sx={{
            width: config.width,
            height: config.width,
            position: "relative",
            cursor: onClick ? "pointer" : "default",
            background: isCompleted
              ? getCategoryColor(category)
              : "rgba(255, 255, 255, 0.05)",
            border: isCompleted
              ? "none"
              : `2px dashed ${designSystem.colors.surface.border}`,
            borderRadius: 3,
            overflow: "hidden",
            filter: isCompleted ? "none" : "grayscale(50%)",
            opacity: isActive ? 1 : 0.6,
            transition: "all 0.3s ease",
            "&::before": isCompleted
              ? {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                }
              : {},
            "&:hover": onClick
              ? {
                  transform: "translateY(-2px)",
                  boxShadow: isCompleted
                    ? "0 8px 25px rgba(0,0,0,0.15)"
                    : "0 4px 15px rgba(255,255,255,0.1)",
                }
              : {},
          }}
        >
          <CardContent
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              p: config.padding,
              "&:last-child": { pb: config.padding },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                mb: size === "small" ? 0.5 : 1,
                color: isCompleted ? "white" : designSystem.colors.text.muted,
                opacity: isCompleted ? 1 : 0.7,
              }}
            >
              {typeof icon === "string" ? (
                <Typography
                  variant="h4"
                  component="span"
                  sx={{ fontSize: config.iconSize }}
                >
                  {icon}
                </Typography>
              ) : (
                getCategoryIcon(category)
              )}
            </Box>

            {/* Title */}
            <Typography
              variant={size === "small" ? "caption" : "body2"}
              sx={{
                fontWeight: 600,
                color: isCompleted
                  ? "white"
                  : designSystem.colors.text.secondary,
                lineHeight: 1.2,
                mb: size === "large" ? 1 : 0.5,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {name}
            </Typography>

            {/* Points */}
            {size !== "small" && (
              <Chip
                label={`${points} pts`}
                size="small"
                sx={{
                  fontSize: "0.7rem",
                  height: 20,
                  background: isCompleted
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: isCompleted ? "white" : designSystem.colors.text.muted,
                  border: "none",
                }}
              />
            )}
          </CardContent>

          {/* Progress Indicator */}
          {showProgress && !isCompleted && progressPercentage > 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: 1,
              }}
            >
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.2)",
                  "& .MuiLinearProgress-bar": {
                    background: getCategoryColor(category),
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}

          {/* Completed Indicator */}
          {isCompleted && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                p: 0.5,
                backdropFilter: "blur(10px)",
              }}
            >
              <StarIcon sx={{ fontSize: 16, color: "white" }} />
            </Box>
          )}

          {/* Locked Overlay */}
          {!isActive && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <Typography
                variant="caption"
                color="white"
                sx={{ fontWeight: 600 }}
              >
                Coming Soon
              </Typography>
            </Box>
          )}
        </Card>
      </motion.div>
    </Tooltip>
  );
};

AchievementBadge.propTypes = {
  achievement: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string,
    category: PropTypes.string,
    criteria: PropTypes.shape({
      type: PropTypes.string,
      value: PropTypes.number,
    }),
    points: PropTypes.number,
    isActive: PropTypes.bool,
  }).isRequired,
  userProgress: PropTypes.shape({
    progress: PropTypes.number,
    isCompleted: PropTypes.bool,
    unlockedAt: PropTypes.string,
  }),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  showProgress: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default AchievementBadge;
