// src/pages/LoginPage/index.jsx
import React, { useMemo } from "react";
import Layout from "../../components/Layout";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { login } from "../../store/actions/authActions";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(search), [search]);
  const justVerified = urlParams.get("verified") === "1";

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await dispatch(login(values));
        navigate("/dashboard");
      } catch (error) {
        setFieldError("general", "Login failed. Please try again.");
      }
      setSubmitting(false);
    },
  });

  return (
    <Layout>
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box mt={8}>
            <Typography variant="h4" gutterBottom>
              Login
            </Typography>
            {justVerified && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Your email has been verified. You can now log in.
              </Alert>
            )}
            {formik.errors.general && (
              <Alert severity="error">{formik.errors.general}</Alert>
            )}
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.email)}
                helperText={formik.errors.email}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.password)}
                helperText={formik.errors.password}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={formik.isSubmitting}
                sx={{ mt: 2 }}
              >
                {formik.isSubmitting ? "Logging In..." : "Login"}
              </Button>
            </form>
          </Box>
        </motion.div>
      </Container>
    </Layout>
  );
};

export default LoginPage;
