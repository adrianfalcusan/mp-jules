import React, { useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Navbar from "../Navbar";
import Footer from "../Footer";
import BackToTop from "../BackToTop";
import { motion } from "framer-motion";
import Toast from "../../shared/components/Toast";

const Layout = ({ paddingTop, children }) => {
  const computedPaddingTop = useMemo(() => {
    return paddingTop !== undefined ? paddingTop : "80px";
  }, [paddingTop]);

  const [authErrorOpen, setAuthErrorOpen] = useState(false);
  useEffect(() => {
    const handler = () => setAuthErrorOpen(true);
    window.addEventListener("auth:refresh-failed", handler);
    return () => window.removeEventListener("auth:refresh-failed", handler);
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <Navbar />
      <Box sx={{ minHeight: "100vh" }}>
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ flexGrow: 1 }}
        >
          <Box sx={{ pt: computedPaddingTop }}>{children}</Box>
        </motion.main>
      </Box>
      <Footer />
      <BackToTop />
      <Toast
        open={authErrorOpen}
        onClose={() => setAuthErrorOpen(false)}
        severity="warning"
        message="Your session expired. Please log in again to continue."
        autoHideDuration={4000}
      />
    </Box>
  );
};

Layout.propTypes = {
  paddingTop: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default React.memo(Layout);
