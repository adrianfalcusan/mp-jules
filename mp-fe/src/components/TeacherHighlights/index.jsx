import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import AnimatedSection from "../AnimatedSection";
import TeacherCard from "../TeacherCard";

const CARD_W = 260; // trebuie să fie același cu flex‑basis din TeacherCard
const GAP_W = 0; // dacă vrei spații între carduri, modifică și CSS & calc
const SPEED = 60; // pixeli pe secundă – mărește → mai rapid

export default function TeacherHighlights({ teachers = [], loading = false }) {
  const trackRef = React.useRef(null);
  const [loopList, setLoop] = React.useState([]);

  /* ───────────────────────────── 1. asigurăm 2× viewport width */
  const rebuildLoop = React.useCallback(() => {
    if (!teachers.length) return;

    const vw = window.innerWidth;
    const cardsInView = Math.ceil(vw / (CARD_W + GAP_W));
    const needed = cardsInView * 2; // două „ecrane”
    const tmp = [];

    while (tmp.length < needed) tmp.push(...teachers);
    tmp.length = needed; // tai surplusul

    setLoop(tmp);
  }, [teachers]);

  React.useEffect(rebuildLoop, [rebuildLoop]);
  React.useEffect(() => {
    window.addEventListener("resize", rebuildLoop);
    return () => window.removeEventListener("resize", rebuildLoop);
  }, [rebuildLoop]);

  /* ───────────────────────────── 2. măsurăm banda (după imagini) */
  const [distancePx, setDistance] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!trackRef.current) return;

    const updatePx = () => setDistance(trackRef.current.scrollWidth / 2); // jumătate din bandă

    updatePx(); // init

    const ro = new ResizeObserver(updatePx); // imagini + font‑load + orice
    ro.observe(trackRef.current);

    return () => ro.disconnect();
  }, [loopList]);

  /* ───────────────────────────── 3. animația perfectă */
  const duration = distancePx ? distancePx / SPEED : 40;

  const marquee = {
    animate: {
      x: [0, -distancePx],
      transition: {
        ease: "linear",
        duration,
        repeat: Infinity,
        repeatType: "loop",
      },
    },
  };

  /* ───────────────────────────── 4. rendering */
  if (loading) {
    return (
      <AnimatedSection delay={0.2}>
        <Typography align="center" sx={{ py: 8 }}>
          Se încarcă instructorii...
        </Typography>
      </AnimatedSection>
    );
  }
  if (!teachers.length) return null;

  return (
    <AnimatedSection delay={0.2}>
      <Box sx={{ py: 26 }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Cunoaște instructorii noștri
        </Typography>
        <Typography align="center" sx={{ mb: 4, opacity: 0.7 }}>
          Descoperă echipa noastră de mentori – defilează fără sfârșit.
        </Typography>

        <Box sx={{ overflow: "hidden", width: "100%" }}>
          <Box
            ref={trackRef}
            component={motion.div}
            variants={marquee}
            animate="animate"
            sx={{ display: "flex", gap: `${GAP_W}px` }}
          >
            {loopList.map((t, i) => (
              <Box key={`${t._id}-${i}`} sx={{ flex: `0 0 ${CARD_W}px` }}>
                <TeacherCard
                  teacher={t}
                  image="https://music-platform-af.s3.eu-central-1.amazonaws.com/profile-images/no-image.png"
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </AnimatedSection>
  );
}
