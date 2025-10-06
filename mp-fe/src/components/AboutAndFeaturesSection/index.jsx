// src/components/AboutAndFeaturesSection/index.jsx
import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion, useReducedMotion } from "framer-motion";
import AnimatedSection from "../AnimatedSection";
/* ───────────── features */
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Diversity3Icon from "@mui/icons-material/Diversity3";
/* ───────────── font‑faces doar pentru această componentă */
const fontInject = `
@font-face{
  font-family:"SyneHero";
  font-style:normal;
  font-weight:800;
  src:url("https://fonts.gstatic.com/s/syne/v15/8vINELeC0Yf9T9bGMe6AEbE.ttf") format("truetype");
}
@font-face{
  font-family:"UnboundedHero";
  font-style:normal;
  font-weight:400;
  src:url("https://fonts.gstatic.com/s/unbounded/v4/1cX0aUPOAJvKLOpsie6XOtc.ttf") format("truetype");
}
@font-face{
  font-family:"UnboundedHero";
  font-style:normal;
  font-weight:600;
  src:url("https://fonts.gstatic.com/s/unbounded/v4/1cX4aUPOAJvKLOpsie6XOveCCOA.ttf") format("truetype");
}`;

/* ───────────── palette */
const palette = {
  pink: "#FFFFFF",
  cyan: "#2CD4FF",
  orange: "#FFFFFF",
  offWhite: "#EDEDED",
};

const features = [
  {
    title: "Lecții interactive",
    desc: "Video hands‑on, exerciții gamificate și feedback instantaneu.",
    Icon: PlayCircleOutlineIcon,
    tint: palette.orange,
    blob: { x: "-35%", y: "-25%", scale: 1.05 },
  },
  {
    title: "Mentorare personalizată",
    desc: "Profesori de top îți urmăresc progresul și trimit sugestii dedicate.",
    Icon: StarBorderIcon,
    tint: palette.cyan,
    blob: { x: "-65%", y: "-60%", scale: 1.25 },
  },
  {
    title: "Comunitate vibrantă",
    desc: "Jam‑session‑uri live, challenge‑uri lunare și colaborări între cursanți.",
    Icon: Diversity3Icon,
    tint: palette.pink,
    blob: { x: "-45%", y: "15%", scale: 1.2 },
  },
];

/* ───────────── soft animated blob */
const AnimatedBlob = ({ color, cfg }) => {
  const prefersReduced = useReducedMotion();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      animate={
        prefersReduced
          ? undefined
          : {
              scale: [cfg.scale * 0.95, cfg.scale * 1.05, cfg.scale * 0.95],
              opacity: [0.9, 1, 0.9],
            }
      }
      transition={
        prefersReduced
          ? undefined
          : {
              duration: 14,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }
      }
      sx={{
        position: "absolute",
        top: cfg.y,
        left: cfg.x,
        width: 420,
        height: 420,
        background: `radial-gradient(circle at center, ${alpha(color, 0.4)} 0%, ${alpha(
          color,
          0.1
        )} 60%, transparent 80%)`,
        filter: "blur(100px)",
        borderRadius: "45% 55% 50% 65% / 60% 45% 65% 40%",
        pointerEvents: "none",
        zIndex: -3,
        willChange: "transform, opacity",
      }}
    />
  );
};

/* ───────────── motion variants */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeInOut" } },
};

/* ───────────── component */
export default function AboutAndFeaturesSection() {
  return (
    <AnimatedSection delay={0.05}>
      {/* injectăm fonturile o singură dată */}
      <style>{fontInject}</style>

      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        sx={{ py: { xs: 14, md: 24 }, px: { xs: 3, md: 10 } }}
      >
        {/* Heading */}
        <Typography
          variant="h2"
          sx={{
            fontFamily: "SyneHero, sans-serif",
            fontWeight: 800,
            textAlign: "center",
            letterSpacing: "-0.02em",
            color: palette.offWhite,
            mb: 3,
          }}
        >
          De ce MUSICLOUD?
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: "UnboundedHero, sans-serif",
            fontWeight: 400,
            maxWidth: 760,
            mx: "auto",
            textAlign: "center",
            mb: { xs: 12, md: 18 },
            color: alpha(palette.offWhite, 0.6),
          }}
        >
          Playground muzical unde tehnologia întâlnește creativitatea.
        </Typography>

        {/* Features */}
        <Grid
          container
          spacing={{ xs: 10, md: 0 }}
          justifyContent="space-between"
        >
          {features.map(({ title, desc, Icon, tint, blob }) => (
            <Grid item xs={12} md={4} key={title}>
              <Box
                component={motion.div}
                variants={itemVariants}
                whileHover={{ translateY: -4, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  textAlign: "left",
                  gap: 2.5,
                  px: { xs: 2, md: 3 },
                }}
              >
                <AnimatedBlob color={tint} cfg={blob} />

                <Icon sx={{ fontSize: 40, color: tint }} />

                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "SyneHero, sans-serif",
                    fontWeight: 700,
                    color: palette.offWhite,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "UnboundedHero, sans-serif",
                    color: alpha(palette.offWhite, 0.75),
                    maxWidth: 340,
                  }}
                >
                  {desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AnimatedSection>
  );
}
