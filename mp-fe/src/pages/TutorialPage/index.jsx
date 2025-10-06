import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Alert,
  Button,
  Stack,
  CircularProgress,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Layout from "../../components/Layout";
import SectionWrapper from "../../components/SectionWrapper";
import Spinner from "../../components/Spinner";
import BunnyVideoPlayer from "../../components/BunnyVideoPlayer";
import { apiService } from "../../services/api";
import { selectToken } from "../../store/slices/authSlice";

export default function TutorialPage() {
  const { id } = useParams();
  const token = useSelector(selectToken);

  /* state */
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [buying, setBuying] = useState(false);
  const [buyErr, setBuyErr] = useState("");
  const [buyOk, setBuyOk] = useState("");

  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  /* load tutorial */
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const wasSuccess = query.get("success");
    const wasCancel = query.get("canceled");

    const fetchTut = async () => {
      try {
        const data = await apiService.tutorials.getById(id);
        if (!data.success) throw new Error(data.message || "Load error");
        setTutorial(data.tutorial);

        /* refetch signed video after payment success */
        if (wasSuccess && token && !data.tutorial.videoSignedUrl) {
          try {
            const signed = await apiService.tutorials.getContent(id);
            if (signed.success) {
              setTutorial((prev) => ({
                ...prev,
                videoSignedUrl: signed.videoUrl,
              }));
            }
          } catch (contentError) {}
        }

        if (wasSuccess) setBuyOk("Tutorial purchased successfully!");
        if (wasCancel) setBuyErr("Payment was cancelled.");
      } catch (e) {
        setErr(e.response?.data?.message || e.message || "Loading error.");
      } finally {
        setLoading(false);
      }
    };
    fetchTut();
  }, [id, token]);

  /* fetch multitracks once user has access */
  useEffect(() => {
    const loadTracks = async () => {
      if (!token || !tutorial) return;
      const hasAccess =
        tutorial?.enrolled || tutorial?.purchased || tutorial?.isEnrolled;
      if (!hasAccess) return;
      try {
        setTracksLoading(true);
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/tutorials/${id}/multitracks`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success) setTracks(data.tracks || []);
      } catch (e) {
        console.warn("Multitracks load failed:", e);
      } finally {
        setTracksLoading(false);
      }
    };
    loadTracks();
  }, [id, token, tutorial]);

  /* start checkout */
  const startCheckout = async () => {
    setBuying(true);
    setBuyErr("");
    try {
      const data = await apiService.payments.createSession({
        itemId: id,
        itemType: "tutorial",
      });
      if (!data.success) throw new Error(data.message || "Checkout error");
      window.location.href = data.url; // Stripe redirect
    } catch (e) {
      setBuyErr(e.response?.data?.message || e.message || "Checkout error");
      setBuying(false);
    }
  };

  /* helpers */
  const thumb = tutorial?.thumbnailUrl || tutorial?.thumbnail || "";
  const video = tutorial?.videoSignedUrl || "";
  const isEnrolled = tutorial?.isEnrolled || Boolean(video);

  /* render */
  if (loading) return <Spinner />;

  return (
    <Layout>
      <SectionWrapper sx={{ mt: 4 }}>
        {err ? (
          <Alert severity="error">{err}</Alert>
        ) : (
          <>
            {/* back */}
            <Button
              component={Link}
              to="/courses"
              startIcon={<ArrowBackIcon />}
              sx={{ mb: 4 }}
            >
              Back to catalog
            </Button>

            {/* title */}
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {tutorial?.title}
            </Typography>

            {/* hero thumbnail - only if video is not unlocked */}
            {!isEnrolled && thumb && (
              <Box
                component="img"
                src={thumb}
                alt={tutorial?.title}
                sx={{
                  width: "100%",
                  maxHeight: 340,
                  objectFit: "cover",
                  mb: 3,
                  borderRadius: 2,
                }}
              />
            )}

            {/* player or call-to-action */}
            {isEnrolled ? (
              <Box sx={{ mb: 4 }}>
                <BunnyVideoPlayer
                  tutorialId={id}
                  onProgress={() => {}}
                  showControls={true}
                  autoPlay={false}
                />

                {/* Multitracks */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Multitracks
                  </Typography>
                  {tracksLoading ? (
                    <CircularProgress size={24} />
                  ) : tracks.length === 0 ? (
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      No multitracks available.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {tracks.map((t, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 1,
                            border: "1px solid rgba(0,0,0,0.08)",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {t.name || `Track ${i + 1}`}
                          </Typography>
                          <audio
                            controls
                            src={t.url}
                            style={{ width: "100%" }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            ) : (
              <Stack direction="column" spacing={2} sx={{ mb: 4 }}>
                <Alert severity="warning">
                  Purchase to unlock the full video.
                </Alert>

                {token ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={startCheckout}
                    disabled={buying}
                    sx={{ width: 220 }}
                  >
                    {buying ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      `Buy tutorial • $${tutorial?.price}`
                    )}
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button
                      component={Link}
                      to="/login"
                      variant="contained"
                      color="secondary"
                    >
                      Login
                    </Button>
                    <Button
                      component={Link}
                      to="/signup"
                      variant="outlined"
                      color="secondary"
                    >
                      Sign Up
                    </Button>
                  </Stack>
                )}

                {buyErr && <Alert severity="error">{buyErr}</Alert>}
                {buyOk && <Alert severity="success">{buyOk}</Alert>}
              </Stack>
            )}

            {/* description */}
            {tutorial?.description && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {tutorial.description}
              </Typography>
            )}
          </>
        )}
      </SectionWrapper>
    </Layout>
  );
}
