import React, { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion } from "framer-motion";

// clip demonstrativ (înlocuiește după nevoie)
import promoVideo from "../../assets/video/instruments-teaser.mp4";

/* Utilitar simplu pentru play / pause pe scroll */
const useAutoplayOnView = (ref) => {
  useEffect(() => {
    if (!ref.current) return;
    const vid = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) vid.play();
        else vid.pause();
      },
      { threshold: 0.4 }
    );
    observer.observe(vid);

    return () => observer.disconnect();
  }, [ref]);
};

const bullets = [
  "Cursuri dedicate fiecărui instrument",
  "Modele 3‑D & exerciții interactive",
  "Feedback de la profesori în timp real",
];

const InstrumentPromoSection = ({ videoSrc = promoVideo }) => {
  const videoRef = useRef(null);
  useAutoplayOnView(videoRef);

  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 6, md: 8 },
        alignItems: "center",
        py: { xs: 8, md: 28 },
        px: { xs: 2, md: 4 },
      }}
    >
      {/* ——— Col stânga: mesaj business ——— */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ flex: 1, width: "100%" }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Instrumente pentru fiecare stil
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          De la chitară și pian până la producție muzicală, găsești cursuri
          adaptate nivelului tău – toate într‑un singur loc.
        </Typography>

        <List dense>
          {bullets.map((b) => (
            <ListItem key={b} sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="secondary" />
              </ListItemIcon>
              <ListItemText primary={b} />
            </ListItem>
          ))}
        </List>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ mt: 4 }}
          href="/courses"
        >
          Vezi cursurile
        </Button>
      </motion.div>

      {/* ——— Col dreapta: video ——— */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        style={{ flex: 1, width: "100%" }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 4,
            minHeight: { xs: 220, md: 320 },
          }}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            loop
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* gradient ușor pentru lizibilitate */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              bottom: 16,
              left: 24,
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Descoperă vibe‑ul
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default InstrumentPromoSection;
