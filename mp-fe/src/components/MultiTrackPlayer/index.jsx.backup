/*  src/components/MultiTrackPlayer/index.jsx  */
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  CircularProgress,
  Slider,
  Stack,
  Typography,
  IconButton,
  LinearProgress,
  Paper,
  Chip,
  Fade,
  Zoom,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Hearing,
  MusicNote,
  GraphicEq,
  Equalizer,
} from "@mui/icons-material";
import * as Tone from "tone";

/* ---------- helpers ---------- */
const pretty = (s) =>
  s
    .replace(/\.(mp3|wav)$/i, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
const clamp100 = (v) => Math.min(100, Math.max(0, v));

/* ---------- component ---------- */
function MultiTrackPlayer({ tracks }) {
  // Memoize safe tracks array to prevent unnecessary recalculations
  const safe = useMemo(() => tracks ?? [], [tracks]);

  // Memoize filtered stems to prevent unnecessary recalculations
  const stems = useMemo(() => {
    const filtered = safe
      .filter((t) => t.url && !t.url.endsWith("/"))
      .map((t) => ({ ...t, name: pretty(t.name) }));

    return filtered;
  }, [safe]);

  // Create a stable key for stems to prevent unnecessary reloads
  const stemsKey = useMemo(() => stems.map((s) => s.url).join("|"), [stems]);

  const players = useRef({});
  const songDur = useRef(0);
  const startToneTime = useRef(0);
  const raf = useRef();
  const barRef = useRef(null);
  const seeking = useRef(false);
  const loadedStemsKey = useRef("");
  const playingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [solo, setSolo] = useState(null);
  const [muted, setMuted] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  // Memoize the tick function to prevent unnecessary re-creates
  const tick = useCallback(() => {
    if (!seeking.current && songDur.current > 0) {
      const pct =
        ((Tone.now() - startToneTime.current) / songDur.current) * 100;
      setProgress(clamp100(pct));
      if (pct >= 100) {
        setPlaying(false);
        playingRef.current = false;
        cancelAnimationFrame(raf.current);
        Object.values(players.current).forEach(({ player }) => player.stop());
        return;
      }
    }
    // Continue the animation loop only if still playing
    if (playingRef.current) {
      raf.current = requestAnimationFrame(tick);
    }
  }, []);

  /* ----- load players once ----- */
  useEffect(() => {
    // Early return if no stems or same stems already loaded
    if (stems.length === 0 || stemsKey === loadedStemsKey.current) {
      return;
    }

    let live = true;
    let loaded = 0;

    // Reset state
    setReady(false);
    setPlaying(false);
    playingRef.current = false;
    setProgress(0);
    setLoadingProgress(0);
    setLoadingText("Preparing tracks...");
    songDur.current = 0;

    // Clean up existing players
    Object.values(players.current).forEach(({ player }) => {
      try {
        player.dispose();
      } catch (e) {
        console.warn("Error disposing player:", e);
      }
    });
    players.current = {};

    console.log("Loading", stems.length, "tracks...");

    stems.forEach((s) => {
      const gain = new Tone.Gain(1).toDestination();

      const p = new Tone.Player({
        url: s.url,
        autostart: false,
        onload: () => {
          if (!live) return;

          songDur.current = Math.max(songDur.current, p.buffer.duration);
          loaded++;

          const progressPercent = (loaded / stems.length) * 100;
          setLoadingProgress(progressPercent);
          setLoadingText(`Loading ${s.name}... (${loaded}/${stems.length})`);

          if (loaded === stems.length) {
            console.log(
              "All tracks loaded successfully, duration:",
              songDur.current.toFixed(2),
              "seconds"
            );
            setReady(true);
            setLoadingText("");
            loadedStemsKey.current = stemsKey;
          }
        },
        onerror: (error) => {
          if (!live) return;

          console.error("Error loading track:", s.name, error);
          loaded++;

          const progressPercent = (loaded / stems.length) * 100;
          setLoadingProgress(progressPercent);
          setLoadingText(
            `Failed to load ${s.name} (${loaded}/${stems.length})`
          );

          if (loaded === stems.length) {
            console.log("Finished loading with some errors");
            setReady(true);
            setLoadingText("");
            loadedStemsKey.current = stemsKey;
          }
        },
      }).connect(gain);

      // Set crossOrigin for CORS
      p.crossOrigin = "anonymous";

      // Store player reference
      players.current[s.name] = { player: p, gain };
    });

    return () => {
      live = false;
      cancelAnimationFrame(raf.current);
      // Store current players reference to avoid ref changes during cleanup
      const currentPlayers = players.current;
      Object.values(currentPlayers).forEach(({ player }) => {
        try {
          player.dispose();
        } catch (e) {
          console.warn("Error disposing player:", e);
        }
      });
      players.current = {};
    };
  }, [stems, stemsKey]);

  /* ----- mute / solo logic ----- */
  useEffect(() => {
    if (!ready) return;

    Object.entries(players.current).forEach(([n, { gain }]) => {
      const g = (solo && solo !== n) || muted[n] ? 0 : 1;
      gain.gain.rampTo(g, 0.05);
    });
  }, [muted, solo, ready]);

  /* ----- transport ----- */
  const start = useCallback(async () => {
    if (!ready) return;

    try {
      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      const offset = (songDur.current * progress) / 100;
      const when = Tone.now() + 0.05;

      Object.values(players.current).forEach(({ player }) => {
        player.start(when, offset);
      });

      startToneTime.current = Tone.now() - offset;
      setPlaying(true);
      playingRef.current = true;
      // Start the progress update loop
      raf.current = requestAnimationFrame(tick);
    } catch (error) {
      console.error("Error starting playback:", error);
    }
  }, [ready, progress, tick]);

  const stop = useCallback(() => {
    setPlaying(false);
    playingRef.current = false;
    cancelAnimationFrame(raf.current);
    Object.values(players.current).forEach(({ player }) => {
      try {
        player.stop();
      } catch (e) {
        console.warn("Error stopping player:", e);
      }
    });
  }, []);

  const seekTo = useCallback(
    (pct) => {
      pct = clamp100(pct);
      const offset = (songDur.current * pct) / 100;
      startToneTime.current = Tone.now() - offset;

      if (playing) {
        const when = Tone.now() + 0.05;
        Object.values(players.current).forEach(({ player }) => {
          try {
            player.stop();
            player.start(when, offset);
          } catch (e) {
            console.warn("Error seeking player:", e);
          }
        });
      }
      setProgress(pct);
    },
    [playing]
  );

  /* ----- bar interactions ----- */
  useEffect(() => {
    const el = barRef.current;
    if (!el || !ready) return;

    const toPct = (clientX) => {
      const r = el.getBoundingClientRect();
      return clamp100(((clientX - r.left) / r.width) * 100);
    };

    const down = (e) => {
      seeking.current = true;
      seekTo(toPct(e.clientX));

      const move = (ev) => seekTo(toPct(ev.clientX));
      const up = (ev) => {
        seekTo(toPct(ev.clientX));
        seeking.current = false;
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    };

    el.addEventListener("mousedown", down);
    return () => el.removeEventListener("mousedown", down);
  }, [ready, seekTo]);

  /* ----- render ----- */
  if (!safe.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          my: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress
            size={40}
            sx={{
              color: "rgba(255, 255, 255, 0.8)",
              mb: 2,
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: "rgba(255, 255, 255, 0.9)" }}
          >
            Loading multitrack player...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          p: 3,
          mb: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <GraphicEq sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Multitrack Studio
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  opacity: 0.9,
                }}
              >
                Professional audio mixing experience
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Chip
              icon={<MusicNote />}
              label={`${stems.length} Tracks`}
              sx={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                backdropFilter: "blur(10px)",
                "& .MuiChip-icon": { color: "white" },
              }}
            />
            <Chip
              icon={<Equalizer />}
              label="High Quality"
              sx={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                backdropFilter: "blur(10px)",
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          </Stack>
        </Box>
      </Paper>

      {/* Loading State */}
      {!ready && (
        <Fade in={!ready}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                zIndex: 0,
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={3}
                sx={{ mb: 3 }}
              >
                <CircularProgress size={32} sx={{ color: "white" }} />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: 600 }}
                  >
                    {loadingText || "Preparing your studio..."}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                  >
                    Setting up professional audio processing
                  </Typography>
                </Box>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={loadingProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background:
                      "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
                  },
                  mb: 1,
                }}
              />

              <Typography
                variant="caption"
                sx={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                {Math.round(loadingProgress)}% complete
              </Typography>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Transport Controls */}
      {ready && (
        <Zoom in={ready}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                zIndex: 0,
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={3}>
                <Button
                  variant="contained"
                  onClick={playing ? stop : start}
                  startIcon={playing ? <Pause /> : <PlayArrow />}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 3,
                    background: playing
                      ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
                      : "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {playing ? "Pause Playback" : "Start Playback"}
                </Button>

                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "white",
                      mb: 1,
                      fontWeight: 500,
                    }}
                  >
                    Playback Progress
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    {Math.round(progress)}% •{" "}
                    {songDur.current
                      ? `${((songDur.current * progress) / 100).toFixed(1)}s / ${songDur.current.toFixed(1)}s`
                      : ""}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Zoom>
      )}

      {/* Progress Bar */}
      {ready && (
        <Fade in={ready}>
          <Box sx={{ mb: 4 }}>
            <Box
              ref={barRef}
              sx={{
                position: "relative",
                height: 12,
                width: "100%",
                maxWidth: 800,
                mx: "auto",
                background: "linear-gradient(135deg, #e3e3e3 0%, #d1d1d1 100%)",
                borderRadius: 6,
                userSelect: "none",
                cursor: "pointer",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                overflow: "hidden",
                "&:hover": {
                  transform: "scaleY(1.1)",
                  transition: "transform 0.2s ease",
                },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 12,
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 6,
                  transition:
                    seeking.current || playing ? "none" : "width 0.05s ease",
                  boxShadow: "0 0 10px rgba(102, 126, 234, 0.5)",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                    animation: playing ? "shimmer 2s infinite" : "none",
                  },
                  "@keyframes shimmer": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                  },
                }}
              />
            </Box>
          </Box>
        </Fade>
      )}

      {/* Mixer Console */}
      {ready && (
        <Zoom in={ready}>
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
              borderRadius: 3,
              p: 4,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                zIndex: 0,
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  mb: 3,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                Audio Mixing Console
              </Typography>

              <Stack
                direction="row"
                spacing={3}
                sx={{
                  justifyContent: "center",
                  overflowX: "auto",
                  pb: 2,
                }}
              >
                {stems.map((s, index) => (
                  <Fade
                    in={true}
                    timeout={300 + index * 100}
                    key={`${s.url}-${index}`}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        minWidth: 120,
                        background:
                          "linear-gradient(135deg, #3a4a5c 0%, #2c3e50 100%)",
                        borderRadius: 2,
                        p: 2,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(255, 255, 255, 0.03)",
                          backdropFilter: "blur(5px)",
                          borderRadius: 2,
                        },
                      }}
                    >
                      <Stack
                        alignItems="center"
                        spacing={2}
                        sx={{ position: "relative", zIndex: 1 }}
                      >
                        {/* Track Name */}
                        <Box
                          sx={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: 2,
                            p: 1,
                            minHeight: 40,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            variant="caption"
                            align="center"
                            sx={{
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              lineHeight: 1.2,
                            }}
                          >
                            {s.name}
                          </Typography>
                        </Box>

                        {/* Volume Slider */}
                        <Box
                          sx={{
                            background:
                              "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
                            borderRadius: 2,
                            p: 1,
                            height: 200,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <Slider
                            orientation="vertical"
                            defaultValue={1}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(_, v) => {
                              const playerGain = players.current[s.name]?.gain;
                              if (playerGain) {
                                playerGain.gain.rampTo(v, 0.05);
                              }
                            }}
                            sx={{
                              height: 160,
                              "& .MuiSlider-thumb": {
                                width: 24,
                                height: 12,
                                background:
                                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                border: "2px solid white",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                "&:hover": {
                                  boxShadow:
                                    "0 4px 12px rgba(102, 126, 234, 0.4)",
                                },
                              },
                              "& .MuiSlider-track": {
                                background:
                                  "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                                width: 6,
                                border: "none",
                              },
                              "& .MuiSlider-rail": {
                                background:
                                  "linear-gradient(180deg, #444 0%, #222 100%)",
                                width: 6,
                              },
                            }}
                          />
                        </Box>

                        {/* Control Buttons */}
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setMuted((m) => ({ ...m, [s.name]: !m[s.name] }))
                            }
                            sx={{
                              background: muted[s.name]
                                ? "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
                                : "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
                              color: "white",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              "&:hover": {
                                transform: "scale(1.1)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            {muted[s.name] ? (
                              <VolumeOff fontSize="small" />
                            ) : (
                              <VolumeUp fontSize="small" />
                            )}
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() =>
                              setSolo((p) => (p === s.name ? null : s.name))
                            }
                            sx={{
                              background:
                                solo === s.name
                                  ? "linear-gradient(135deg, #ffd93d 0%, #ff9500 100%)"
                                  : "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
                              color: "white",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              "&:hover": {
                                transform: "scale(1.1)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Hearing fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Fade>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Zoom>
      )}
    </Box>
  );
}

MultiTrackPlayer.propTypes = {
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default MultiTrackPlayer;
