// src/components/ProtectedRoute/index.jsx
import React from "react";
import PropTypes from "prop-types";
import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { ANIMATION_CONFIG } from "../../utils/constants";

const ProtectedRoute = ({ roles = [], redirectPath = "/" }) => {
  // Hooks
  const { isAuthenticated, hasAnyRole } = useAuth();

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check role permissions if roles are specified
  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to={redirectPath} replace />;
  }

  // Render protected content
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

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  redirectPath: PropTypes.string,
};

export default ProtectedRoute;
