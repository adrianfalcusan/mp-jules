const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", "utf8");

// Update transport controls to be more compact and professional
const oldTransport = `      {/* Transport Controls */}
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
                content: \`"\\""\`,
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
                    sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 0.5 }}
                  >
                    {formatTime(progress * songDur.current / 100)} / {formatTime(songDur.current)}
                  </Typography>
                  <Box
                    ref={barRef}
                    sx={{
                      width: "100%",
                      height: 8,
                      background: "rgba(255, 255, 255, 0.3)",
                      borderRadius: 4,
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
                        background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
                        borderRadius: 4,
                        transition: seeking.current ? "none" : "width 0.1s ease",
                      },
                    }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.8)", minWidth: 80 }}>
                  {Math.round(progress)}%
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Zoom>
      )}`;

const newTransport = `      {/* Compact Transport Controls */}
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

content = content.replace(oldTransport, newTransport);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", content);
console.log("��� Updated transport controls with compact, professional design!");
