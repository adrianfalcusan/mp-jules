// src/components/InstrumentSlide/index.jsx
import React from "react";
import PropTypes from "prop-types";

const InstrumentSlide = ({ title, text }) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#1e293b", // Dark slate instead of #2f2f2f
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Left side: text content */}
      <div
        style={{
          flex: 1,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "#f8fafc", // Light slate text
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#f8fafc" }}>{title}</h2>
        <p style={{ color: "#cbd5e1" }}>{text}</p>
      </div>
    </div>
  );
};

InstrumentSlide.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default InstrumentSlide;
