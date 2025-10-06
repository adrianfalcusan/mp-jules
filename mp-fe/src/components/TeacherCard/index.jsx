import React from "react";
import PropTypes from "prop-types";
import { Card } from "@mui/material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import placeholder from "../../assets/img/p1.jpg"; // put any 10 kB jpg here

/* ───────────── styling de bază */

const CardRoot = styled(Card)({
  position: "relative",
  flex: "0 0 260px",
  width: 260,
  aspectRatio: "3 / 4",
  overflow: "hidden",
  borderRadius: 12,
  backgroundColor: "#1e293b", // Dark slate instead of black
  color: "#f8fafc",
  border: "1px solid rgba(255, 255, 255, 0.1)",
});

const Thumb = styled("img")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const Gradient = styled("div")({
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to bottom, rgba(15, 23, 42, 0) 35%, rgba(15, 23, 42, 0.85) 90%)",
});

/* ───────────── componentă */

const FALLBACK = placeholder; // local file, instant & always 200

function TeacherCard({ teacher }) {
  const { name = "Profesor", image } = teacher;

  const imgSrc = image && image.trim() ? image : FALLBACK;

  return (
    <motion.div
      whileHover={{ filter: "brightness(1.15)" }}
      style={{ width: "100%" }}
    >
      <CardRoot elevation={0}>
        <Thumb
          src={imgSrc}
          alt={name}
          onError={(e) => {
            e.currentTarget.onerror = null; // evită loop infinit
            e.currentTarget.src = FALLBACK; // pune placeholder dacă link‑ul real moare
          }}
        />
        <Gradient />
        {/* …restul conținutului… */}
      </CardRoot>
    </motion.div>
  );
}

TeacherCard.propTypes = {
  teacher: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    image: PropTypes.string,
    specialization: PropTypes.string,
    popularity: PropTypes.number,
  }).isRequired,
};

export default React.memo(TeacherCard);
