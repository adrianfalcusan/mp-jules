const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", "utf8");

// Make individual track cards ultra-compact and modern
const oldTrackCard = `                {stems.map((s, index) => (
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

const newTrackCard = `                {stems.map((s, index) => (
                  <Fade
                    in={true}
                    timeout={150 + index * 30}
                    key={\`\${s.url}-\${index}\`}
                  >
                    <Box
                      sx={{
                        minWidth: 80,
                        maxWidth: 100,
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 1.5,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        backdropFilter: "blur(5px)",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.1)",
                          borderColor: "rgba(59, 130, 246, 0.5)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {/* Ultra-Compact Track Header */}
                      <Box
                        sx={{
                          background: `linear-gradient(135deg, \${solo === s.name ? "#10b981" : "#3b82f6"} 0%, \${solo === s.name ? "#059669" : "#1d4ed8"} 100%)`,
                          p: 1,
                          textAlign: "center",
                          minHeight: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            lineHeight: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                          }}
                        >
                          {s.name.length > 8 ? s.name.substring(0, 8) + "..." : s.name}
                        </Typography>
                      </Box>

                      {/* Ultra-Compact Controls */}
                      <Box sx={{ p: 1.5 }}>
                        <Stack spacing={1}>
                          {/* Mini Volume Slider */}
                          <Box sx={{ height: 60 }}>
                            <Slider
                              orientation="vertical"
                              size="small"
                              value={volumes[s.name] ?? 75}
                              onChange={(e, v) => setVolume(s.name, v)}
                              min={0}
                              max={100}
                              sx={{
                                color: "#3b82f6",
                                height: "100%",
                                "& .MuiSlider-track": {
                                  background: "linear-gradient(to top, #3b82f6, #1d4ed8)",
                                  width: 3,
                                },
                                "& .MuiSlider-rail": {
                                  background: "rgba(255, 255, 255, 0.2)",
                                  width: 3,
                                },
                                "& .MuiSlider-thumb": {
                                  width: 12,
                                  height: 12,
                                  background: "#ffffff",
                                  border: "2px solid #3b82f6",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                  "&:hover": {
                                    boxShadow: "0 3px 6px rgba(0,0,0,0.4)",
                                    transform: "scale(1.1)",
                                  },
                                },
                              }}
                            />
                          </Box>

                          {/* Ultra-Compact Control Buttons */}
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => toggleMute(s.name)}
                              sx={{
                                width: 20,
                                height: 20,
                                background: muted[s.name]
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "rgba(255, 255, 255, 0.1)",
                                color: muted[s.name] ? "#ef4444" : "rgba(255, 255, 255, 0.9)",
                                "&:hover": {
                                  background: muted[s.name]
                                    ? "rgba(239, 68, 68, 0.3)"
                                    : "rgba(255, 255, 255, 0.2)",
                                },
                              }}
                            >
                              {muted[s.name] ? <VolumeOff sx={{ fontSize: 12 }} /> : <VolumeUp sx={{ fontSize: 12 }} />}
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => setSolo(solo === s.name ? null : s.name)}
                              sx={{
                                width: 20,
                                height: 20,
                                background: solo === s.name
                                  ? "rgba(16, 185, 129, 0.2)"
                                  : "rgba(255, 255, 255, 0.1)",
                                color: solo === s.name ? "#10b981" : "rgba(255, 255, 255, 0.9)",
                                "&:hover": {
                                  background: solo === s.name
                                    ? "rgba(16, 185, 129, 0.3)"
                                    : "rgba(255, 255, 255, 0.2)",
                                },
                              }}
                            >
                              <Hearing sx={{ fontSize: 12 }} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    </Box>
                  </Fade>
                ))}`;

content = content.replace(oldTrackCard, newTrackCard);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", content);
console.log("✅ Redesigned individual track cards to be ultra-compact and modern!");
