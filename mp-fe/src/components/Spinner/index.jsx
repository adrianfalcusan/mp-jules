// src/components/Spinner/index.jsx
import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";

const Spinner = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Box display="flex" justifyContent="center" alignItems="center" my={4}>
      <CircularProgress color="primary" />
    </Box>
  </motion.div>
);

export default React.memo(Spinner);
