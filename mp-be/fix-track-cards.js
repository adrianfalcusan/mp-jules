const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", "utf8");

// Update individual track cards to be more compact and professional
const oldTrackCard = `                {stems.map((s, index) => (
                  <Fade
                    in={true}
                    timeout={300 + index * 100}
                    key={\`\${s.url}-\${index}\`}
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
                          content: \`"\\""\`,
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
                            alignItems: "flex-end",
                            justifyContent: "center",
                            width: "100%",
                          }}
                        >
                          <Box sx={{ width: "100%", height: "100%" }}>
                            <Slider
                              orientation="vertical"
                              value={volumes[s.name] ?? 75}
                              onChange={(e, v) => setVolume(s.name, v)}
                              min={0}
                              max={100}
                              sx={{
                                color: "#4facfe",
                                height: "100%",
                                "& .MuiSlider-track": {
                                  background: "linear-gradient(to top, #4facfe, #00f2fe)",
                                  borderRadius: 2,
                                },
                                "& .MuiSlider-rail": {
                                  background: "rgba(255, 255, 255, 0.3)",
                                  borderRadius: 2,
                                },
                                "& .MuiSlider-thumb": {
                                  background: "white",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                  width: 16,
                                  height: 16,
                                  "&:hover": {
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                                    transform: "scale(1.1)",
                                  },
                                },
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Controls */}
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => toggleMute(s.name)}
                            sx={{
                              background: muted[s.name]
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(255, 255, 255, 0.1)",
                              color: muted[s.name] ? "#ef4444" : "white",
                              "&:hover": {
                                background: muted[s.name]
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "rgba(255, 255, 255, 0.2)",
                              },
                            }}
                          >
                            {muted[s.name] ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() => setSolo(solo === s.name ? null : s.name)}
                            sx={{
                              background: solo === s.name
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(255, 255, 255, 0.1)",
                              color: solo === s.name ? "#10b981" : "white",
                              "&:hover": {
                                background: solo === s.name
                                  ? "rgba(16, 185, 129, 0.2)"
                                  : "rgba(255, 255, 255, 0.2)",
                              },
                            }}
                          >
                            <Hearing fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Fade>
                ))}`;

const newTrackCard = `                {stems.map((s, index) => (
                  <Fade
                    in={true}
                    timeout={200 + index * 50}
                    key={\`\${s.url}-\${index}\`}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        minWidth: 140,
                        maxWidth: 160,
                        background: "#f8fafc",
                        borderRadius: 2,
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#3b82f6",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {/* Track Header */}
                      <Box
                        sx={{
                          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          p: 1.5,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.name}
                        </Typography>
                      </Box>

                      {/* Volume Control - Horizontal & Compact */}
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#64748b",
                                fontSize: "0.7rem",
                                mb: 0.5,
                                display: "block",
                              }}
                            >
                              Volume
                            </Typography>
                            <Slider
                              size="small"
                              value={volumes[s.name] ?? 75}
                              onChange={(e, v) => setVolume(s.name, v)}
                              min={0}
                              max={100}
                              sx={{
                                color: "#3b82f6",
                                "& .MuiSlider-track": {
                                  background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                                  height: 4,
                                },
                                "& .MuiSlider-rail": {
                                  background: "#e2e8f0",
                                  height: 4,
                                },
                                "& .MuiSlider-thumb": {
                                  width: 14,
                                  height: 14,
                                  background: "#ffffff",
                                  border: "2px solid #3b82f6",
                                  boxShadow: "0 2px 6px rgba(59, 130, 246, 0.3)",
                                  "&:hover": {
                                    boxShadow: "0 4px 8px rgba(59, 130, 246, 0.4)",
                                    transform: "scale(1.1)",
                                  },
                                },
                              }}
                            />
                          </Box>

                          {/* Compact Controls */}
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => toggleMute(s.name)}
                              sx={{
                                width: 28,
                                height: 28,
                                background: muted[s.name]
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : "rgba(59, 130, 246, 0.1)",
                                color: muted[s.name] ? "#ef4444" : "#3b82f6",
                                border: "1px solid",
                                borderColor: muted[s.name] ? "#fecaca" : "#bfdbfe",
                                "&:hover": {
                                  background: muted[s.name]
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "rgba(59, 130, 246, 0.2)",
                                },
                              }}
                            >
                              {muted[s.name] ? <VolumeOff sx={{ fontSize: 14 }} /> : <VolumeUp sx={{ fontSize: 14 }} />}
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => setSolo(solo === s.name ? null : s.name)}
                              sx={{
                                width: 28,
                                height: 28,
                                background: solo === s.name
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : "rgba(59, 130, 246, 0.1)",
                                color: solo === s.name ? "#10b981" : "#3b82f6",
                                border: "1px solid",
                                borderColor: solo === s.name ? "#a7f3d0" : "#bfdbfe",
                                "&:hover": {
                                  background: solo === s.name
                                    ? "rgba(16, 185, 129, 0.2)"
                                    : "rgba(59, 130, 246, 0.2)",
                                },
                              }}
                            >
                              <Hearing sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    </Paper>
                  </Fade>
                ))}`;

content = content.replace(oldTrackCard, newTrackCard);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", content);
console.log("✅ Updated individual track cards with compact, professional design!");
