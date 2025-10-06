import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievementNotifications } from "../../hooks/useAchievements";

const AchievementNotification = ({ notification, onClose }) => {
  const { achievement } = notification;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        type: "spring",
        damping: 20,
        stiffness: 100,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: 350,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
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
        <CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {/* Achievement Icon */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {typeof achievement.icon === "string" ? (
                    <Typography variant="h4" component="span">
                      {achievement.icon}
                    </Typography>
                  ) : (
                    <TrophyIcon sx={{ fontSize: 32 }} />
                  )}

                  {/* Sparkle effects */}
                  <motion.div
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                    }}
                  >
                    <StarIcon sx={{ fontSize: 16, color: "#ffd700" }} />
                  </motion.div>
                </Box>
              </motion.div>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Achievement Unlocked! 🎉
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                {achievement.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {achievement.description}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  opacity: 0.8,
                  fontWeight: 600,
                }}
              >
                +{achievement.points} points earned
              </Typography>
            </Box>

            {/* Close Button */}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </CardContent>

        {/* Animated border */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(90deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)",
            transformOrigin: "left",
          }}
        />
      </Card>
    </motion.div>
  );
};

const AchievementNotifications = ({ position = "top-right" }) => {
  const { notifications, removeNotification } = useAchievementNotifications();

  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed",
      zIndex: 9999,
      p: 2,
      pointerEvents: "none",
    };

    switch (position) {
      case "top-right":
        return { ...baseStyles, top: 20, right: 20 };
      case "top-left":
        return { ...baseStyles, top: 20, left: 20 };
      case "bottom-right":
        return { ...baseStyles, bottom: 20, right: 20 };
      case "bottom-left":
        return { ...baseStyles, bottom: 20, left: 20 };
      case "top-center":
        return {
          ...baseStyles,
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "bottom-center":
        return {
          ...baseStyles,
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
        };
      default:
        return { ...baseStyles, top: 20, right: 20 };
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Box sx={getPositionStyles()}>
      <Stack spacing={2} sx={{ pointerEvents: "auto" }}>
        <AnimatePresence>
          {notifications.map((notification) => (
            <AchievementNotification
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </Stack>
    </Box>
  );
};

AchievementNotification.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number.isRequired,
    achievement: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string,
      points: PropTypes.number,
    }).isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

AchievementNotifications.propTypes = {
  position: PropTypes.oneOf([
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
    "top-center",
    "bottom-center",
  ]),
};

export default AchievementNotifications;
