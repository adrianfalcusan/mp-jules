import React, { useCallback } from "react";
import { useScrollTrigger, Fab } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
import { motion } from "framer-motion";

const BackToTop = () => {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 200 });

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: trigger ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: "fixed", bottom: 16, right: 16, zIndex: 3000 }}
    >
      <Fab color="secondary" size="small" onClick={handleClick}>
        <KeyboardArrowUp />
      </Fab>
    </motion.div>
  );
};

export default React.memo(BackToTop);
