import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import scrollDown from "../../assets/img/scroll-down.png";
import bgVideo from "../../assets/video/abstractguy.mp4";

const HeroSection = ({ onShowLoginModal, onShowSignupModal }) => {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* 🎬 Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Dark overlay for contrast */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          zIndex: 0,
        }}
      />

      {/* Animated content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ zIndex: 1 }}
      >
        <Typography
          variant="h1"
          sx={{
            fontFamily: "SyneHero, sans-serif",
            fontSize: { xs: "2.8rem", sm: "4.2rem", md: "6.2rem" },
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: "uppercase",
            background:
              "linear-gradient(90deg,#ffffff 0%,#59A5D8 45%,#2CD4FF 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            color: "transparent",
            animation: "shift 8s linear infinite",
            "@keyframes shift": {
              "0%": { backgroundPosition: "0% 0%" },
              "100%": { backgroundPosition: "100% 0%" },
            },
            mb: 2,
          }}
        >
          MUSICLOUD
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontFamily: "UnboundedHero, sans-serif",
            fontWeight: 400,
            color: "#EDEDED",
            maxWidth: 640,
            mx: "auto",
            mb: 5,
          }}
        >
          Cursuri video cu profesori adevărați. Începe‑ți călătoria muzicală
          astăzi.
        </Typography>

        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mb: 8 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 4,
              fontWeight: 700,
              bgcolor: "#2CD4FF",
              ":hover": { bgcolor: "#59A5D8" },
            }}
            onClick={onShowSignupModal}
          >
            Începe acum
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              px: 4,
              color: "#fff",
              borderColor: "#fff",
              ":hover": { bgcolor: "rgba(255,255,255,0.08)" },
            }}
            onClick={onShowLoginModal}
          >
            Autentificare
          </Button>
        </Box>
      </motion.div>

      {/* Bottom left message + scroll indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 300, color: "white" }}
        >
          Lecții interactive. Progres real.
          <br />
          Oriunde, oricând.
        </Typography>
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
            style={{ marginRight: "1rem" }}
          />
        </a>
      </Box>
    </Box>
  );
};

export default HeroSection;
