import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, LinearProgress, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { designSystem } from "../../../theme";

const LoadingFallback = ({
  message = "Loading...",
  description = "Please wait while we prepare your content",
  showProgress = true,
  variant = "default", // default, minimal, splash
}) => {
  const variants = {
    default: {
      height: "50vh",
      showBackground: true,
      showDescription: true,
    },
    minimal: {
      height: "20vh",
      showBackground: false,
      showDescription: false,
    },
    splash: {
      height: "100vh",
      showBackground: true,
      showDescription: true,
    },
  };

  const config = variants[variant];

  return (
    <Box
      sx={{
        height: config.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: config.showBackground
          ? `linear-gradient(135deg, ${designSystem.colors.background.primary} 0%, ${designSystem.colors.background.secondary} 100%)`
          : "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Animation */}
      {config.showBackground && (
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 50%, rgba(79, 172, 254, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        />
      )}

      {/* Content */}
      <Stack
        spacing={3}
        alignItems="center"
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        {/* Loading Animation */}
        <Box sx={{ position: "relative" }}>
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{
              width: variant === "minimal" ? 40 : 60,
              height: variant === "minimal" ? 40 : 60,
              border: `3px solid ${designSystem.colors.surface.border}`,
              borderTop: `3px solid ${designSystem.colors.primary[400]}`,
              borderRadius: "50%",
            }}
          />

          {/* Inner Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: variant === "minimal" ? 28 : 40,
              height: variant === "minimal" ? 28 : 40,
              border: `2px solid transparent`,
              borderTop: `2px solid ${designSystem.colors.primary[300]}`,
              borderRadius: "50%",
            }}
          />

          {/* Center Dot */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: variant === "minimal" ? 8 : 12,
              height: variant === "minimal" ? 8 : 12,
              background: `linear-gradient(135deg, ${designSystem.colors.primary[400]} 0%, ${designSystem.colors.primary[600]} 100%)`,
              borderRadius: "50%",
            }}
          />
        </Box>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography
            variant={variant === "minimal" ? "body1" : "h5"}
            sx={{
              fontWeight: 600,
              color: designSystem.colors.text.primary,
              mb: config.showDescription ? 1 : 0,
            }}
          >
            {message}
          </Typography>

          {config.showDescription && (
            <Typography
              variant="body2"
              sx={{
                color: designSystem.colors.text.secondary,
                opacity: 0.8,
              }}
            >
              {description}
            </Typography>
          )}
        </motion.div>

        {/* Progress Bar */}
        {showProgress && config.showBackground && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ width: "100%" }}
          >
            <LinearProgress
              sx={{
                height: 4,
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${designSystem.colors.primary[400]} 0%, ${designSystem.colors.primary[600]} 100%)`,
                  borderRadius: 2,
                },
              }}
            />
          </motion.div>
        )}

        {/* Loading Dots */}
        {variant !== "minimal" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Stack direction="row" spacing={0.5}>
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: 6,
                    height: 6,
                    background: designSystem.colors.primary[400],
                    borderRadius: "50%",
                  }}
                />
              ))}
            </Stack>
          </motion.div>
        )}
      </Stack>
    </Box>
  );
};

// Specialized loading components for different contexts
export const PageLoadingFallback = (props) => (
  <LoadingFallback
    variant="default"
    message="Loading Page..."
    description="Setting up your learning environment"
    {...props}
  />
);

export const ComponentLoadingFallback = (props) => (
  <LoadingFallback
    variant="minimal"
    message="Loading..."
    showProgress={false}
    {...props}
  />
);

export const SplashLoadingFallback = (props) => (
  <LoadingFallback
    variant="splash"
    message="Music Platform"
    description="Your musical journey awaits"
    {...props}
  />
);

LoadingFallback.propTypes = {
  message: PropTypes.string,
  description: PropTypes.string,
  showProgress: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "minimal", "splash"]),
};

export default LoadingFallback;
