import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import scrollDown from "../../assets/img/scroll-down.png";

const FloatingWidget = () => {
  return (
    <Box
      sx={{
        width: "95vw",
        maxWidth: 600,
        padding: "48px",
        color: "#fff",
        boxShadow: "0px 4px 16px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        zIndex: 1000,
        backdropFilter: "blur(10px)",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "start",
          marginBottom: "24px",
        }}
      >
        <a href="#featured_music">
          <motion.img
            src={scrollDown}
            width="20"
            height="42"
            alt="Scroll Down"
            animate={{ y: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        </a>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 300, color: "white" }}>
        Master your voice <br />
        Unleash your inner artist.
      </Typography>
    </Box>
  );
};

export default FloatingWidget;
