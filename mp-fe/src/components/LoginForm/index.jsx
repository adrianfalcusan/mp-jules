// src/components/LoginForm/index.jsx
import React, { useEffect, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import { ANIMATION_CONFIG } from "../../utils/constants";

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginForm = ({ onClose, redirectPath }) => {
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { user, loading, error, login, clearError } = useAuth();

  // Password visibility toggle
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Event handlers
  const handleSubmit = useCallback(
    async (values, { setSubmitting, setFieldError }) => {
      try {
        clearError();
        const result = await login(values);

        if (result.success) {
          onClose();
          navigate(redirectPath);
        } else {
          setFieldError("general", result.error);
        }
      } catch (err) {
        setFieldError("general", "An unexpected error occurred");
      } finally {
        setSubmitting(false);
      }
    },
    [login, clearError, onClose, navigate, redirectPath]
  );

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  // Effects
  useEffect(() => {
    if (user) {
      onClose();
      navigate(redirectPath);
    }
  }, [user, onClose, navigate, redirectPath]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Helper function for field props
  const getFieldProps = useCallback(
    (fieldName) => ({
      ...formik.getFieldProps(fieldName),
      error: Boolean(formik.touched[fieldName] && formik.errors[fieldName]),
      helperText: formik.touched[fieldName] && formik.errors[fieldName],
      fullWidth: true,
      margin: "normal",
    }),
    [formik]
  );

  // Render
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_CONFIG.DURATION.NORMAL }}
    >
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            mb: 3,
          }}
        >
          Welcome Back
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {formik.errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formik.errors.general}
          </Alert>
        )}

        <TextField
          {...getFieldProps("email")}
          label="Email Address"
          type="email"
          autoComplete="email"
          autoFocus
        />

        <TextField
          {...getFieldProps("password")}
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={formik.isSubmitting || loading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {formik.isSubmitting || loading ? "Signing In..." : "Sign In"}
        </Button>
      </Box>
    </motion.div>
  );
};

LoginForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  redirectPath: PropTypes.string,
};

LoginForm.defaultProps = {
  redirectPath: "/courses",
};

export default LoginForm;
