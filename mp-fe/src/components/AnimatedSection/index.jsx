import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const AnimatedSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, delay }}
    style={{ width: "100%" }}
  >
    {children}
  </motion.div>
);

AnimatedSection.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

export default React.memo(AnimatedSection);
