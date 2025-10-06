import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Alert,
} from "@mui/material";
import Layout from "../../components/Layout";
import theme from "../../theme";
import { apiService } from "../../services/api";
import axios from "axios";
import ENV from "../../config/environment";
import { SUCCESS_MESSAGES, STORAGE_KEYS } from "../../utils/constants";
import { selectToken, setUser, selectUser } from "../../store/slices/authSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const userFromStore = useSelector(selectUser);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [purchases, setPurchases] = useState({ courses: [], tutorials: [] });

  useEffect(() => {
    (async () => {
      try {
        const tokenLS = localStorage.getItem("token");
        const headers = tokenLS ? { Authorization: `Bearer ${tokenLS}` } : {};
        const [myCourses, myTuts] = await Promise.all([
          axios.get(`${ENV.API_BASE_URL}/courses/my-student-courses`, {
            headers,
          }),
          axios.get(`${ENV.API_BASE_URL}/tutorials/my-student-tutorials`, {
            headers,
          }),
        ]);
        const enrolledCourses = (myCourses.data?.courses || []).map((c) => ({
          id: c._id,
          title: c.title,
          type: "course",
          date: c.enrolledAt || c.createdAt,
        }));
        const enrolledTutorials = (myTuts.data?.tutorials || []).map((t) => ({
          id: t._id,
          title: t.title,
          type: "tutorial",
          date: t.enrolledAt || t.createdAt,
        }));
        setPurchases({
          courses: enrolledCourses,
          tutorials: enrolledTutorials,
        });
      } catch (_) {
        // non-blocking
      }
    })();
    (async () => {
      try {
        const res = await apiService.users.me();
        setName(res.user.name || "");
        setEmail(res.user.email || "");
        if (!userFromStore || userFromStore.email !== res.user.email) {
          dispatch(setUser({ user: res.user, token }));
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
          }
        }
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await apiService.users.updateMe({ name });
      dispatch(setUser({ user: res.user, token }));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
      }
      setSuccess(SUCCESS_MESSAGES.PROFILE_UPDATED);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await apiService.users.changePassword({ currentPassword, newPassword });
      setSuccess("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper elevation={0} sx={{ p: 4 }}>
            <Typography variant="h6">Loading profile…</Typography>
          </Paper>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Account Settings
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            Manage your profile information and account security
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Info */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.text.primary,
                }}
              >
                Profile
              </Typography>

              <Box component="form" onSubmit={onSave}>
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    value={email}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Box>
                    <Button type="submit" variant="contained">
                      Save changes
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Security */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: theme.palette.text.primary,
                }}
              >
                Security
              </Typography>

              <Box component="form" onSubmit={onChangePassword}>
                <Stack spacing={2}>
                  <TextField
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Box>
                    <Button type="submit" variant="outlined">
                      Update Password
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Sections (placeholders to match pro layout) */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              id="purchases"
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Purchases
              </Typography>
              {purchases.courses.length === 0 &&
              purchases.tutorials.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No purchases yet.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {[...purchases.courses, ...purchases.tutorials]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 10)
                    .map((p) => (
                      <Box
                        key={`${p.type}-${p.id}`}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography>
                          <a
                            href={`/${p.type === "course" ? "courses" : "tutorial"}/${p.id}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {p.title}
                          </a>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(p.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure email and in-app notifications (coming soon).
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Billing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage payment methods and invoices (coming soon).
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
