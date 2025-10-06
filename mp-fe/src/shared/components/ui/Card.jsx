import React from "react";
import { Card as MuiCard, CardContent, CardActions } from "@mui/material";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { designSystem } from "../../../theme";

const Card = ({
  children,
  title,
  onClick,
  hover = true,
  sx = {},
  ...props
}) => {
  const cardStyles = {
    backgroundColor: designSystem.colors.background.secondary,
    borderRadius: designSystem.borderRadius.xl,
    border: "1px solid " + designSystem.colors.surface.border,
    transition: "all " + designSystem.animations.duration[200] + " " + designSystem.animations.easing.smooth,
    cursor: onClick ? "pointer" : "default",
    ...(hover && {
      "&:hover": {
        borderColor: designSystem.colors.surface.borderBright,
        boxShadow: designSystem.shadows.lg,
        transform: "translateY(-2px)",
      },
    }),
    ...sx,
  };

  const CardComponent = (
    <MuiCard
      elevation={0}
      sx={cardStyles}
      onClick={onClick}
      {...props}
    >
      <CardContent sx={{ p: designSystem.spacing[3] }}>
        {children}
      </CardContent>
    </MuiCard>
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: designSystem.animations.easing.smooth }}
      >
        {CardComponent}
      </motion.div>
    );
  }

  return CardComponent;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  onClick: PropTypes.func,
  hover: PropTypes.bool,
  sx: PropTypes.object,
};

export default Card;
