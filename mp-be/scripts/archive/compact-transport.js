const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", "utf8");

// Make transport controls ultra-compact
const oldTransport = `      {/* Compact Transport Controls */}
      {ready && (
        <Zoom in={ready}>
          <Paper
            elevation={0}
            sx={{
              background: "#ffffff",
              borderRadius: 2,
              p: 2,
              mb: 2,
              border: "1px solid #e2e8f0",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Play/Pause Button */}
              <Button
                variant="contained"
                onClick={playing ? stop : start}
                startIcon={playing ? <Pause /> : <PlayArrow />}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  background: playing
                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textTransform: "none",
                  minWidth: "auto",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {playing ? "Pause" : "Play"}
              </Button>

              {/* Progress Section */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontFamily: "monospace",
                    mb: 0.5,
                    fontSize: "0.8rem",
                  }}
                >
                  {formatTime(progress * songDur.current / 100)} / {formatTime(songDur.current)}
                </Typography>
                <Box
                  ref={barRef}
                  sx={{
                    width: "100%",
                    height: 6,
                    background: "#e2e8f0",
                    borderRadius: 3,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: \`"\\""\`,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: \`\${progress}%\`,
                      height: "100%",
                      background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)",
                      borderRadius: 3,
                      transition: seeking.current ? "none" : "width 0.1s ease",
                    },
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontFamily: "monospace",
                  minWidth: 35,
                  fontSize: "0.8rem",
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Stack>
          </Paper>
        </Zoom>
      )}`;

const newTransport = `      {/* Ultra-Compact Transport Controls */}
      {ready && (
        <Zoom in={ready}>
          <Box
            sx={{
              background: "rgba(30, 41, 59, 0.8)",
              borderRadius: 2,
              p: 1.5,
              mb: 1.5,
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Compact Play/Pause Button */}
              <IconButton
                onClick={playing ? stop : start}
                sx={{
                  background: playing
                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {playing ? <Pause sx={{ fontSize: 18 }} /> : <PlayArrow sx={{ fontSize: 18 }} />}
              </IconButton>

              {/* Ultra-Compact Progress */}
              <Box sx={{ flex: 1, minWidth: 120 }}>
                <Box
                  ref={barRef}
                  sx={{
                    width: "100%",
                    height: 4,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 2,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: \`"\\""\`,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: \`\${progress}%\`,
                      height: "100%",
                      background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)",
                      borderRadius: 2,
                      transition: seeking.current ? "none" : "width 0.1s ease",
                    },
                  }}
                />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                    }}
                  >
                    {formatTime(progress * songDur.current / 100)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                    }}
                  >
                    {formatTime(songDur.current)}
                  </Typography>
                </Stack>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontFamily: "monospace",
                  minWidth: 30,
                  fontSize: "0.7rem",
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Stack>
          </Box>
        </Zoom>
      )}`;

content = content.replace(oldTransport, newTransport);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", content);
console.log("✅ Updated transport controls to ultra-compact design!");
