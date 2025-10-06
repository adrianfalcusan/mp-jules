// src/pages/SignupPage/index.jsx
import React from "react";
import Layout from "../../components/Layout";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  MenuItem,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { signup } from "../../store/actions/authActions";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", role: "student" },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string()
        .min(6, "Minimum 6 characters")
        .required("Required"),
      role: Yup.string().oneOf(["student", "teacher"]).required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await dispatch(signup(values));
        navigate("/dashboard");
      } catch (error) {
        setFieldError("general", "Signup failed. Please try again.");
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
              Sign Up
            </Typography>
            {formik.errors.general && (
              <Alert severity="error">{formik.errors.general}</Alert>
            )}
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.name)}
                helperText={formik.errors.name}
              />
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
              <TextField
                select
                fullWidth
                margin="normal"
                label="Role"
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.role)}
                helperText={formik.errors.role}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
              </TextField>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={formik.isSubmitting}
                sx={{ mt: 2 }}
              >
                {formik.isSubmitting ? "Signing Up..." : "Sign Up"}
              </Button>
            </form>
          </Box>
        </motion.div>
      </Container>
    </Layout>
  );
};

export default SignupPage;
