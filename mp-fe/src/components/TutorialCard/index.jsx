/* src/components/TutorialCard/index.jsx */
import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Card, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/system";

const CardRoot = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.spacing(2.5),
  width: "100%",
  /* keeps 2 : 3 aspect ratio */
  "&::before": { content: '""', display: "block", paddingTop: "150%" },
  color: theme.palette.text.primary,
  backgroundColor: "#1e293b", // Dark slate instead of grey[900]
  textDecoration: "none",
  border: "1px solid rgba(255, 255, 255, 0.1)",
}));

const Thumb = styled("img")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
});
const Shade = styled("div")({
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)",
});
const Title = styled(Typography)({
  position: "absolute",
  bottom: 20,
  left: 20,
  right: 20,
  textShadow: "0 2px 6px rgba(15, 23, 42, 0.8)",
});

function TutorialCard({ tutorial }) {
  if (!tutorial) return null;

  const { _id, title = "Untitled", thumbnailUrl, image, isNew } = tutorial;
  const imgSrc = thumbnailUrl || image || "/assets/course-fallback.jpg";

  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: "0 12px 25px rgba(15, 23, 42, 0.4)",
      }}
    >
      {/* ►► correct path is /tutorial/<id>  */}
      <CardRoot component={Link} to={`/tutorial/${_id}`}>
        <Thumb src={imgSrc} alt={title} />
        <Shade />
        {isNew && (
          <Chip
            label="Nou"
            color="secondary"
            size="small"
            sx={{ position: "absolute", top: 14, left: 14, fontWeight: 700 }}
          />
        )}
        <Title variant="h5" sx={{ fontFamily: `"Bebas Neue", sans-serif` }}>
          {title}
        </Title>
      </CardRoot>
    </motion.div>
  );
}

TutorialCard.propTypes = {
  tutorial: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    image: PropTypes.string,
    isNew: PropTypes.bool,
  }).isRequired,
};

export default React.memo(TutorialCard);
