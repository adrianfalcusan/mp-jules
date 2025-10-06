import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const VisualsSection = ({ gifs = [], speed = 40 }) => {
  // Dublăm lista pentru buclă fără întreruperi
  const loopGifs = React.useMemo(() => [...gifs, ...gifs], [gifs]);

  const trackVariants = {
    animate: {
      x: ["0%", "-50%"],
      transition: { x: { duration: speed, ease: "linear", repeat: Infinity } },
    },
  };

  return (
    <Box component="section" sx={{ bgcolor: "#111", py: 8, color: "#fff" }}>
      {/* Heading */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Experimentează vibe‑ul
        </Typography>
        <Typography
          variant="body1"
          sx={{ maxWidth: 600, mx: "auto", opacity: 0.8 }}
        >
          Descoperă energia cursurilor prin secvențe autentice din platformă.
        </Typography>
      </Box>

      {/* Marquee */}
      <Box
        sx={{
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Box
          component={motion.div}
          variants={trackVariants}
          animate="animate"
          sx={{ display: "flex" }}
        >
          {loopGifs.map((gif, idx) => (
            <motion.div
              key={`${idx}-${gif}`}
              whileHover={{ scale: 1.04, filter: "brightness(1.15)" }}
              style={{ flex: "0 0 360px" }} // lățime fixă pentru tempo constant
            >
              <Box
                sx={{
                  width: 360,
                  height: 202, // 16:9 pe 360px
                  mr: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <img
                  src={gif}
                  alt={`vibe-${idx}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default VisualsSection;
