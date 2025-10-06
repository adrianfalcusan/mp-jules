// src/components/PublicRoute/index.jsx
import React from "react";
import PropTypes from "prop-types";
import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { ANIMATION_CONFIG } from "../../utils/constants";

const PublicRoute = ({ redirectPath }) => {
  // Hooks
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Render public content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION_CONFIG.DURATION.NORMAL }}
    >
      <Outlet />
    </motion.div>
  );
};

PublicRoute.propTypes = {
  redirectPath: PropTypes.string,
};

PublicRoute.defaultProps = {
  redirectPath: "/courses",
};

export default PublicRoute;
