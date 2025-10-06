import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import Layout from "../../components/Layout";
import theme from "../../theme";
import { apiService } from "../../services/api";
import ENV from "../../config/environment";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const VerifyEmailPage = () => {
  const query = useQuery();
  const initialToken = query.get("token") || "";

  const [token] = useState(initialToken);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // One‑click flow: if token is present in URL, redirect to backend GET endpoint
  useEffect(() => {
    if (token) {
      const backendBase = ENV.API_BASE_URL.replace(/\/?api\/?$/, "");
      window.location.replace(
        `${backendBase}/api/auth/verify-email?token=${encodeURIComponent(token)}`
      );
    }
  }, [token]);

  const resend = async () => {
    setSuccess("");
    setError("");
    try {
      await apiService.auth.resendVerification(email);
      setSuccess("If the email exists, a new verification link was sent.");
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
              textAlign: "center",
            }}
          >
            Verify Email
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.secondary, textAlign: "center" }}
          >
            {token ? "Verifying your email…" : "Resend your verification link"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Only show manual/resend UI when there is no token in URL */}
        {!token && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Resend verification link
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="outlined" onClick={resend} disabled={!email}>
                Resend Link
              </Button>
            </Stack>
          </Paper>
        )}
      </Container>
    </Layout>
  );
};

export default VerifyEmailPage;
