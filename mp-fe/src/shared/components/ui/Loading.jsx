import React from "react";
import { Box, CircularProgress, Typography, LinearProgress } from "@mui/material";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { designSystem } from "../../../theme";

const LoadingSpinner = ({
  size = 40,
  color = "primary",
  message,
  overlay = false,
  ...props
}) => {
  const containerStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: designSystem.spacing[3],
    ...(overlay && {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: designSystem.colors.background.overlay,
      zIndex: designSystem.zIndex.modal,
    }),
  };

  const spinnerColor = color === "primary" ? designSystem.colors.primary[500] : designSystem.colors.secondary[500];

  return (
    <Box sx={containerStyles} {...props}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <CircularProgress
          size={size}
          sx={{ color: spinnerColor }}
        />
      </motion.div>
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: designSystem.colors.text.secondary,
            textAlign: "center",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.oneOf(["primary", "secondary"]),
  message: PropTypes.string,
  overlay: PropTypes.bool,
};

const LoadingBar = ({
  progress,
  message,
  showPercentage = true,
  ...props
}) => {
  return (
    <Box sx={{ width: "100%", ...props.sx }}>
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: designSystem.colors.text.secondary,
            mb: designSystem.spacing[2],
          }}
        >
          {message}
        </Typography>
      )}
      <LinearProgress
        variant={progress !== undefined ? "determinate" : "indeterminate"}
        value={progress}
        sx={{
          borderRadius: designSystem.borderRadius.full,
          backgroundColor: designSystem.colors.background.tertiary,
          "& .MuiLinearProgress-bar": {
            borderRadius: designSystem.borderRadius.full,
            background: designSystem.colors.primary.gradient,
          },
        }}
      />
      {showPercentage && progress !== undefined && (
        <Typography
          variant="caption"
          sx={{
            color: designSystem.colors.text.muted,
            mt: designSystem.spacing[1],
            textAlign: "right",
          }}
        >
          {Math.round(progress)}%
        </Typography>
      )}
    </Box>
  );
};

LoadingBar.propTypes = {
  progress: PropTypes.number,
  message: PropTypes.string,
  showPercentage: PropTypes.bool,
};

export { LoadingSpinner, LoadingBar };
