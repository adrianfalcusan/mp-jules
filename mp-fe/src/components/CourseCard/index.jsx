import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Typography, Chip } from "@mui/material";
import { styled } from "@mui/system";

/**
 * <CourseCard /> - responsive poster-style tile (MUI)
 * ===================================================
 * • **100% width of its parent** - works perfectly inside an MUI <Grid item>.
 * • Keeps a 2:3 aspect ratio via `aspect-ratio: 2/3` (Firefox 89+, Safari 15+, Chrome 88+).
 * • Full-bleed thumbnail, dark gradient, bold headline.
 * • Optional "Nou" chip if `course.isNew === true`.
 * • Cycles through 5 display fonts so each headline feels bespoke.
 *
 * ONE-TIME FONT IMPORT
 * --------------------
 *   @import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:wght@700&family=Anton&family=Lora:wght@700&family=Montserrat:wght@800&display=swap");
 */

// Config

const DISPLAY_FONTS = [
  '"Bebas Neue", sans-serif',
  '"Playfair Display", serif',
  '"Anton", sans-serif',
  '"Lora", serif',
  '"Montserrat", sans-serif',
];
const pickFont = (seed = 0) =>
  DISPLAY_FONTS[Math.abs(seed) % DISPLAY_FONTS.length];

const hoverMotion = {
  hover: {
    scale: 1.05,
    boxShadow: "0 12px 25px rgba(15, 23, 42, 0.4)",
    transition: { duration: 0.25 },
  },
};

// Styled components

const CardContainer = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(2.5),
  width: "100%", // occupy full width of Grid item
  aspectRatio: "2 / 3", // maintain 2:3 ratio regardless of width
  color: theme.palette.text.primary,
  backgroundColor: "#1e293b", // Dark slate instead of grey[900]
  textDecoration: "none", // remove <Link> underline
  display: "flex",
  flexDirection: "column",
  border: "1px solid rgba(255, 255, 255, 0.1)",
}));

const Thumbnail = styled("img")(() => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
}));

const Gradient = styled("div")(() => ({
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)",
}));

const Title = styled(Typography)(() => ({
  position: "absolute",
  bottom: 20,
  left: 20,
  right: 20,
  lineHeight: 1.05,
  textShadow: "0 2px 6px rgba(15, 23, 42, 0.8)",
}));

// Component

function CourseCard({ course, index = 0 }) {
  if (!course) return null;

  const { _id, title = "Untitled Course", thumbnailUrl, image, thumbnailKey, isNew } = course;

  // Handle thumbnail URLs properly - prioritize Bunny CDN URLs
  let imageUrl = "/assets/course-fallback.jpg";

  if (thumbnailUrl) {
    imageUrl = thumbnailUrl; // Bunny CDN URL
  } else if (image) {
    imageUrl = image; // Legacy field
  } else if (thumbnailKey) {
    imageUrl = `http://localhost:8080/uploads/${thumbnailKey}`; // Local fallback
  }
  const fontFamily = pickFont(index);

  return (
    <motion.div
      variants={hoverMotion}
      whileHover="hover"
      style={{ width: "100%" }}
    >
      <CardContainer component={Link} to={`/courses/${_id}`}>
        <Thumbnail src={imageUrl} alt={title} />
        <Gradient />

        {isNew && (
          <Chip
            label="Nou"
            color="secondary"
            size="small"
            sx={{ position: "absolute", top: 14, left: 14, fontWeight: 700 }}
          />
        )}

        <Title variant="h5" sx={{ fontFamily }}>
          {title}
        </Title>
      </CardContainer>
    </motion.div>
  );
}

// PropTypes & memo

CourseCard.propTypes = {
  course: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    image: PropTypes.string,
    isNew: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number,
};

export default React.memo(CourseCard);
