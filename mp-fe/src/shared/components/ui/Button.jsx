import React from "react";
import { Button as MuiButton, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { designSystem } from "../../../theme";

const Button = ({
  children,
  variant = "contained",
  color = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  sx = {},
  ...props
}) => {
  const buttonStyles = {
    borderRadius: designSystem.borderRadius.lg,
    textTransform: "none",
    fontWeight: designSystem.typography.weights.medium,
    fontSize: designSystem.typography.sizes.sm,
    padding: size === "small" 
      ? designSystem.spacing[1] + " " + designSystem.spacing[3] 
      : size === "large" 
        ? designSystem.spacing[3] + " " + designSystem.spacing[6]
        : designSystem.spacing[2] + " " + designSystem.spacing[4],
    transition: "all " + designSystem.animations.duration[200] + " " + designSystem.animations.easing.smooth,
    position: "relative",
    overflow: "hidden",
    
    ...(variant === "contained" && {
      background: color === "primary" 
        ? designSystem.colors.primary.gradient 
        : color === "secondary" 
          ? designSystem.colors.secondary.gradient 
          : undefined,
      color: designSystem.colors.text.primary,
      boxShadow: designSystem.shadows.md,
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: designSystem.shadows.lg,
      },
      "&:active": {
        transform: "translateY(0)",
      },
    }),
    
    ...(variant === "outlined" && {
      borderColor: designSystem.colors.surface.borderBright,
      color: designSystem.colors.text.primary,
      backgroundColor: "transparent",
      "&:hover": {
        borderColor: color === "primary" ? designSystem.colors.primary[500] : designSystem.colors.secondary[500],
        backgroundColor: designSystem.colors.surface.hover,
        transform: "translateY(-1px)",
      },
    }),
    
    ...(variant === "text" && {
      color: designSystem.colors.text.primary,
      backgroundColor: "transparent",
      "&:hover": {
        backgroundColor: designSystem.colors.surface.hover,
      },
    }),
    
    ...(disabled && {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none !important",
    }),
    
    ...sx,
  };

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2, ease: designSystem.animations.easing.smooth }}
    >
      <MuiButton
        variant={variant}
        color={color}
        size={size}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        startIcon={!loading ? startIcon : undefined}
        endIcon={!loading ? endIcon : undefined}
        onClick={onClick}
        sx={buttonStyles}
        {...props}
      >
        {loading && (
          <CircularProgress
            size={16}
            sx={{ 
              color: "inherit",
              marginRight: designSystem.spacing[2] 
            }}
          />
        )}
        {children}
      </MuiButton>
    </motion.div>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
  color: PropTypes.oneOf(["primary", "secondary", "success", "error", "info", "warning"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  onClick: PropTypes.func,
  sx: PropTypes.object,
};

export default Button;
