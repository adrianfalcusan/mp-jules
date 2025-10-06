import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Container,
  Grid,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  GraphicEq as GraphicEqIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  PlayCircle as PlayCircleIcon,
  Verified as VerifiedIcon,
  MusicNote as MusicNoteIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled } from "@mui/system";

import Layout from "../Layout";
import Spinner from "../Spinner";
import MultiTrackPlayer from "../MultiTrackPlayer";
import ProgressTrackingVideoPlayer from "../ProgressTrackingVideoPlayer";
import { ENV } from "../../config/environment";
import ReviewForm from "../ReviewForm";
import PurchaseOverlay from "../../shared/components/PurchaseOverlay";
import Toast from "../../shared/components/Toast";

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
function setOG(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// Modern Theme Colors
const theme = {
  primary: {
    main: "#6366f1",
    light: "#8b5cf6",
    dark: "#4f46e5",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  },
  secondary: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  },
  background: {
    main: "#0f172a",
    paper: "#1e293b",
    light: "#334155",
    lighter: "#475569",
  },
  text: {
    primary: "#f8fafc",
    secondary: "#cbd5e1",
    muted: "#64748b",
  },
  success: "#10b981",
  error: "#ef4444",
};

// Styled Components
const StyledContainer = styled(Container)(() => ({
  minHeight: "100vh",
  paddingTop: "2rem",
  paddingBottom: "4rem",
  position: "relative",
  zIndex: 2,
}));

const BackgroundWrapper = styled(Box)(() => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.background.main} 0%, ${theme.background.paper} 100%)`,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 30% 50%, ${theme.primary.main}15 0%, transparent 50%), radial-gradient(circle at 70% 50%, ${theme.secondary.main}15 0%, transparent 50%)`,
    zIndex: 1,
  },
}));

const HeroSection = styled(Box)(() => ({
  position: "relative",
  borderRadius: "24px",
  overflow: "hidden",
  background: `linear-gradient(135deg, ${theme.background.paper} 0%, ${theme.background.light} 100%)`,
  border: `1px solid rgba(255, 255, 255, 0.1)`,
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  marginBottom: "3rem",
}));

const VideoContainer = styled(Box)(() => ({
  position: "relative",
  borderRadius: "16px",
  overflow: "hidden",
  background: theme.background.paper,
  border: `1px solid rgba(255, 255, 255, 0.1)`,
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
}));

const ThumbnailOverlay = styled(Box)(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background:
    "linear-gradient(45deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  zIndex: 2,
}));

const PurchaseButton = styled(Button)(() => ({
  background: theme.primary.gradient,
  color: theme.text.primary,
  fontWeight: 700,
  fontSize: "1.1rem",
  padding: "16px 32px",
  borderRadius: "12px",
  textTransform: "none",
  boxShadow: "0 8px 25px rgba(99, 102, 241, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 35px rgba(99, 102, 241, 0.6)",
  },
  "&:disabled": {
    background: theme.background.lighter,
    color: theme.text.muted,
  },
}));

const StatsChip = styled(Chip)(() => ({
  background: "rgba(255, 255, 255, 0.1)",
  color: theme.text.secondary,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  fontWeight: 600,
  "& .MuiChip-icon": {
    color: theme.primary.main,
  },
}));

const ActionButton = styled(IconButton)(() => ({
  background: "rgba(255, 255, 255, 0.1)",
  color: theme.text.secondary,
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(99, 102, 241, 0.2)",
    color: theme.primary.main,
    transform: "translateY(-2px)",
  },
}));

const ContentSection = styled(Paper)(() => ({
  padding: "2rem",
  background: `rgba(255, 255, 255, 0.05)`,
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "20px",
  marginBottom: "2rem",
}));

export default function TutorialPage() {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [tutorial, setTutorial] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trkLoading, setTrkLoading] = useState(false);
  const [err, setErr] = useState("");
  const [buying, setBuying] = useState(false);
  const [buyErr, setBuyErr] = useState("");
  const [buyOk, setBuyOk] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (tutorial?.title) {
      document.title = `${tutorial.title} — Tutorial · MUSICLOUD`;
      setMeta(
        "description",
        (tutorial.description || "Music tutorial").slice(0, 160)
      );
      setOG("og:title", `${tutorial.title} — MUSICLOUD`);
      setOG(
        "og:description",
        (tutorial.description || "Music tutorial").slice(0, 160)
      );
    }
  }, [tutorial]);

  /* ───────── 1. fetch tutorial */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wasSuccess = params.get("success");
    const wasCancel = params.get("canceled");

    const load = async () => {
      try {
        const { data } = await axios.get(
          `${ENV.API_BASE_URL}/tutorials/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!data.success) throw new Error(data.message || "Load error");
        setTutorial(data.tutorial);

        if (wasSuccess === "true") {
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 2000);
        } else if (wasCancel === "true") {
          setBuyErr("Purchase was canceled.");
        }
      } catch (error) {
        console.error("Error loading tutorial:", error);
        setErr(error.message || "Failed to load tutorial");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, token]);

  // Post-checkout polling to handle delayed webhook (with backoff)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wasSuccess = params.get("success");
    if (wasSuccess !== "true") return;

    let cancelled = false;
    let attempts = 0;
    let delay = 1500;
    setFinishing(true);

    const poll = async () => {
      attempts += 1;
      try {
        const { data } = await axios.get(
          `${ENV.API_BASE_URL}/tutorials/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (
          data.success &&
          (data.tutorial?.enrolled || data.tutorial?.purchased)
        ) {
          if (!cancelled) {
            setTutorial(data.tutorial);
            params.delete("success");
            window.history.replaceState(
              {},
              "",
              `${window.location.pathname}?${params.toString()}`
            );
            setFinishing(false);
            return;
          }
        }
      } catch (_) {
        // ignore
      }
      if (!cancelled && attempts < 10) {
        delay = Math.min(delay * 1.5, 5000);
        setTimeout(poll, delay);
      } else if (!cancelled) {
        setFinishing(false);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const handleRestoreAccess = async () => {
    const params = new URLSearchParams(window.location.search);
    try {
      setFinishing(true);
      const { data } = await axios.get(`${ENV.API_BASE_URL}/tutorials/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (data.success) {
        setTutorial(data.tutorial);
        if (data.tutorial?.enrolled || data.tutorial?.purchased) {
          params.delete("success");
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${params.toString()}`
          );
        }
      }
    } finally {
      setFinishing(false);
    }
  };

  /* ───────── 2. load multitracks */
  const loadMultitracks = useCallback(async () => {
    if (!tutorial) return;
    setTrkLoading(true);
    try {
      const { data } = await axios.get(
        `${ENV.API_BASE_URL}/tutorials/${id}/multitracks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        setTracks(data.tracks || []);
      }
    } catch (error) {
      console.error("Error loading multitracks:", error);
    } finally {
      setTrkLoading(false);
    }
  }, [tutorial, id, token]);

  /* ───────── 3. computed values */
  const computed = useMemo(() => {
    if (!tutorial) return { enrolled: false, video: null, thumb: null };

    const enrolled = tutorial.enrolled || tutorial.purchased;
    const video =
      tutorial.videoSignedUrl || tutorial.videoUrl || tutorial.videoPath;
    const thumb = tutorial.thumbnailUrl || tutorial.thumbnailPath;

    return { enrolled, video, thumb };
  }, [tutorial]);

  const retryLoadMultitracks = useCallback(() => {
    loadMultitracks();
  }, [loadMultitracks]);

  useEffect(() => {
    if (tutorial && computed.enrolled) {
      loadMultitracks();
    }
  }, [tutorial, computed.enrolled, loadMultitracks]);

  /* ───────── 4. checkout */
  const startCheckout = async () => {
    setBuying(true);
    setBuyErr("");
    setBuyOk("");
    try {
      const { data } = await axios.post(
        `${ENV.API_BASE_URL}/payments/create-session`,
        {
          itemId: id,
          itemType: "tutorial",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setBuyErr(error.response?.data?.message || "Checkout failed");
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <Spinner />;
  if (err) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
          <Button component={Link} to="/catalog" startIcon={<ArrowBackIcon />}>
            Back to Catalog
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <BackgroundWrapper>
        <StyledContainer maxWidth="lg">
          {/* Finishing purchase toast */}
          <PurchaseOverlay
            open={finishing}
            text="Finalizing your access..."
            showRestore={!computed.enrolled}
            onRestore={handleRestoreAccess}
          />
          {/* Success Toast */}
          <Toast
            open={showSuccessToast}
            onClose={() => setShowSuccessToast(false)}
            severity="success"
            message="Purchase successful! You now have access to this tutorial."
            autoHideDuration={2500}
          />
          {tutorial && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Back Button */}
              <Box sx={{ mb: 3 }}>
                <Button
                  component={Link}
                  to="/catalog"
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    color: theme.text.secondary,
                    "&:hover": {
                      color: theme.primary.main,
                      background: "rgba(99, 102, 241, 0.1)",
                    },
                  }}
                >
                  Back to Catalog
                </Button>
              </Box>

              {/* Hero Section */}
              <HeroSection>
                <Box sx={{ p: 4 }}>
                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={8}>
                      {/* Title and Badge */}
                      <Box sx={{ mb: 3 }}>
                        {computed.enrolled && (
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                              label="OWNED"
                              sx={{
                                background: theme.success,
                                color: "white",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                height: "28px",
                                "& .MuiChip-icon": {
                                  color: "white",
                                },
                              }}
                            />
                          </Box>
                        )}
                        <Typography
                          variant="h3"
                          sx={{
                            color: theme.text.primary,
                            fontWeight: 800,
                            lineHeight: 1.2,
                            wordBreak: "break-word",
                          }}
                        >
                          {tutorial.title}
                        </Typography>
                      </Box>

                      {/* Teacher Info */}
                      {tutorial.teacher && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 3,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              background: theme.primary.gradient,
                              fontSize: "1.5rem",
                              fontWeight: 700,
                            }}
                          >
                            {tutorial.teacher.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: theme.text.primary,
                                fontWeight: 600,
                              }}
                            >
                              {tutorial.teacher.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: theme.text.muted }}
                            >
                              Music Instructor
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Stats */}
                      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <StatsChip
                          icon={<StarIcon />}
                          label={
                            tutorial?.averageRating > 0
                              ? `${tutorial.averageRating.toFixed(1)} Rating`
                              : "No ratings yet"
                          }
                          size="small"
                        />
                        <StatsChip
                          icon={<SchoolIcon />}
                          label={`${tutorial?.students || tutorial?.purchaseCount || 0} Students`}
                          size="small"
                        />
                        <StatsChip
                          icon={<TimeIcon />}
                          label={tutorial?.formattedDuration || "Duration TBD"}
                          size="small"
                        />
                      </Stack>

                      {/* Action Buttons */}
                      <Stack direction="row" spacing={2}>
                        <Tooltip title="Share Tutorial">
                          <ActionButton>
                            <ShareIcon />
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Save to Bookmarks">
                          <ActionButton>
                            <BookmarkIcon />
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Download Resources">
                          <ActionButton>
                            <DownloadIcon />
                          </ActionButton>
                        </Tooltip>
                      </Stack>
                    </Grid>

                    {/* Price and Purchase */}
                    <Grid item xs={12} md={4}>
                      {!computed.enrolled && (
                        <Paper
                          elevation={0}
                          sx={{
                            background: "rgba(30, 41, 59, 0.8)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "20px",
                            p: 3,
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            variant="h2"
                            sx={{
                              color: theme.text.primary,
                              fontWeight: 800,
                              mb: 1,
                            }}
                          >
                            ${tutorial?.price || 0}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: theme.text.muted,
                              mb: 3,
                            }}
                          >
                            One-time purchase • Lifetime access
                          </Typography>

                          {/* What's Included */}
                          <Box sx={{ mb: 3, textAlign: "left" }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: theme.text.primary,
                                fontWeight: 600,
                                mb: 2,
                              }}
                            >
                              What&apos;s included:
                            </Typography>
                            <Stack spacing={1.5}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <PlayCircleIcon
                                  sx={{ fontSize: 16, color: theme.success }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: theme.text.secondary }}
                                >
                                  HD video lesson
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <MusicNoteIcon
                                  sx={{ fontSize: 16, color: theme.success }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: theme.text.secondary }}
                                >
                                  Multitrack audio files
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <DownloadIcon
                                  sx={{ fontSize: 16, color: theme.success }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: theme.text.secondary }}
                                >
                                  Downloadable resources
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <CheckCircleIcon
                                  sx={{ fontSize: 16, color: theme.success }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{ color: theme.text.secondary }}
                                >
                                  Lifetime access
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>

                          {token ? (
                            <PurchaseButton
                              fullWidth
                              onClick={startCheckout}
                              disabled={buying}
                              startIcon={
                                buying ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <ShoppingCartIcon />
                                )
                              }
                              size="large"
                            >
                              {buying ? "Processing..." : "Get Instant Access"}
                            </PurchaseButton>
                          ) : (
                            <Stack spacing={2}>
                              <Alert
                                severity="info"
                                sx={{
                                  background: "rgba(59, 130, 246, 0.1)",
                                  color: theme.text.secondary,
                                  border: `1px solid rgba(59, 130, 246, 0.3)`,
                                  borderRadius: "12px",
                                }}
                              >
                                Please log in to purchase this tutorial
                              </Alert>
                              <Stack direction="row" spacing={2}>
                                <Button
                                  component={Link}
                                  to="/login"
                                  variant="contained"
                                  fullWidth
                                  sx={{
                                    background: theme.primary.gradient,
                                    fontWeight: 600,
                                    textTransform: "none",
                                    borderRadius: "12px",
                                  }}
                                >
                                  Login
                                </Button>
                                <Button
                                  component={Link}
                                  to="/signup"
                                  variant="outlined"
                                  fullWidth
                                  sx={{
                                    color: theme.text.secondary,
                                    borderColor: "rgba(255, 255, 255, 0.3)",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    borderRadius: "12px",
                                    "&:hover": {
                                      borderColor: theme.primary.main,
                                      background: "rgba(99, 102, 241, 0.1)",
                                    },
                                  }}
                                >
                                  Sign Up
                                </Button>
                              </Stack>
                            </Stack>
                          )}

                          {/* Error Messages */}
                          {buyErr && (
                            <Alert
                              severity="error"
                              sx={{
                                mt: 2,
                                background: "rgba(239, 68, 68, 0.1)",
                                color: theme.error,
                                border: `1px solid rgba(239, 68, 68, 0.3)`,
                                borderRadius: "12px",
                              }}
                            >
                              {buyErr}
                            </Alert>
                          )}
                        </Paper>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </HeroSection>

              {/* Video Player Section */}
              <VideoContainer sx={{ mb: 4 }}>
                {computed.enrolled ? (
                  <Box sx={{ position: "relative" }}>
                    <ProgressTrackingVideoPlayer
                      src={computed.video}
                      contentType="tutorial"
                      contentId={id}
                      onProgressUpdate={(progress) => {
                        console.log("Tutorial progress:", progress);
                      }}
                      style={{
                        borderRadius: "16px",
                        display: "block",
                        minHeight: "400px",
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ position: "relative", minHeight: "400px" }}>
                    {computed.thumb && (
                      <Box
                        component="img"
                        src={computed.thumb}
                        alt={tutorial?.title}
                        sx={{
                          width: "100%",
                          height: "400px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <ThumbnailOverlay>
                      <PlayCircleIcon
                        sx={{
                          fontSize: "5rem",
                          color: theme.primary.main,
                          mb: 2,
                          opacity: 0.9,
                        }}
                      />
                      <Typography
                        variant="h4"
                        sx={{
                          color: theme.text.primary,
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        Premium Content
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.text.secondary,
                          textAlign: "center",
                          maxWidth: "400px",
                        }}
                      >
                        Purchase this tutorial to unlock the full video content
                        and multitrack files
                      </Typography>
                    </ThumbnailOverlay>
                  </Box>
                )}
              </VideoContainer>

              {/* Description */}
              {tutorial?.description && (
                <ContentSection>
                  <Typography
                    variant="h5"
                    sx={{
                      color: theme.text.primary,
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    About This Tutorial
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.text.secondary,
                      lineHeight: 1.8,
                      fontSize: "1.1rem",
                    }}
                  >
                    {tutorial.description}
                  </Typography>
                </ContentSection>
              )}

              {/* What's Included */}
              <ContentSection>
                <Typography
                  variant="h5"
                  sx={{
                    color: theme.text.primary,
                    fontWeight: 700,
                    mb: 3,
                  }}
                >
                  What&apos;s Included
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ color: theme.success, fontSize: 24 }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ color: theme.text.secondary }}
                      >
                        Full HD video content
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ color: theme.success, fontSize: 24 }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ color: theme.text.secondary }}
                      >
                        Multitrack audio files
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ color: theme.success, fontSize: 24 }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ color: theme.text.secondary }}
                      >
                        Lifetime access
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ color: theme.success, fontSize: 24 }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ color: theme.text.secondary }}
                      >
                        Mobile & desktop access
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </ContentSection>

              {/* Multitrack Player */}
              {computed.enrolled && (
                <ContentSection>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <GraphicEqIcon
                      sx={{ color: theme.primary.main, fontSize: "2rem" }}
                    />
                    <Typography
                      variant="h5"
                      sx={{
                        color: theme.text.primary,
                        fontWeight: 700,
                      }}
                    >
                      Multitrack Studio
                    </Typography>
                  </Box>

                  {trkLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 4,
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress
                        size={24}
                        sx={{ color: theme.primary.main }}
                      />
                      <Typography sx={{ color: theme.text.secondary }}>
                        Loading multitrack files...
                      </Typography>
                    </Box>
                  ) : tracks === null ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography sx={{ color: theme.text.muted, mb: 2 }}>
                        No multitrack files loaded yet
                      </Typography>
                      <Button
                        onClick={retryLoadMultitracks}
                        variant="outlined"
                        sx={{
                          color: theme.primary.main,
                          borderColor: theme.primary.main,
                          "&:hover": {
                            background: "rgba(99, 102, 241, 0.1)",
                          },
                        }}
                      >
                        Load Multitracks
                      </Button>
                    </Box>
                  ) : tracks.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography sx={{ color: theme.text.muted, mb: 2 }}>
                        No multitrack files available for this tutorial
                      </Typography>
                      <Button
                        onClick={retryLoadMultitracks}
                        variant="outlined"
                        sx={{
                          color: theme.primary.main,
                          borderColor: theme.primary.main,
                          "&:hover": {
                            background: "rgba(99, 102, 241, 0.1)",
                          },
                        }}
                      >
                        Retry
                      </Button>
                    </Box>
                  ) : (
                    <MultiTrackPlayer
                      tracks={tracks}
                      contentType="tutorial"
                      contentId={id}
                      onProgressUpdate={(progress) => {
                        console.log("Multitrack progress:", progress);
                      }}
                    />
                  )}
                </ContentSection>
              )}

              {/* Feedback Messages */}
              {buyErr && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    background: "rgba(239, 68, 68, 0.1)",
                    color: theme.error,
                    border: `1px solid rgba(239, 68, 68, 0.3)`,
                    borderRadius: "12px",
                  }}
                >
                  {buyErr}
                </Alert>
              )}
              {buyOk && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    background: "rgba(16, 185, 129, 0.1)",
                    color: theme.success,
                    border: `1px solid rgba(16, 185, 129, 0.3)`,
                    borderRadius: "12px",
                  }}
                >
                  {buyOk}
                </Alert>
              )}

              {/* Reviews Section */}
              <ReviewForm
                itemId={id}
                itemType="tutorial"
                onReviewSubmitted={() => {
                  // Optionally refresh tutorial data to update rating
                  console.log("Review submitted for tutorial", id);
                }}
              />
            </motion.div>
          )}
        </StyledContainer>
      </BackgroundWrapper>
    </Layout>
  );
}
