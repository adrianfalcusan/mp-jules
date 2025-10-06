const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CourseDetailPage/index.jsx", "utf8");

// Replace the multitrack section with the same pattern as TutorialPage
const oldMultitrackSection = `                {/* Multitracks */}
                {isEnrolled && activeLesson?.materials?.multitracks?.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <MultitrackIcon />
                      Multitracks
                    </Typography>
                    <Stack spacing={2}>
                      {activeLesson.materials.multitracks.map((track, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            {track.name || "Track " + (index + 1)}
                          </Typography>
                          <audio
                            controls
                            src={track.url}
                            style={{ width: "100%" }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}`;

const newMultitrackSection = `                {/* Multitracks */}
                {isEnrolled && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Multitracks
                    </Typography>
                    {activeLesson?.materials?.multitracks?.length > 0 ? (
                      <Stack spacing={1}>
                        {activeLesson.materials.multitracks.map((track, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0,0,0,0.08)",
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                              {track.name || "Track " + (index + 1)}
                            </Typography>
                            <audio
                              controls
                              src={track.url}
                              style={{ width: "100%" }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        No multitracks available for this lesson.
                      </Typography>
                    )}
                  </Box>
                )}`;

content = content.replace(oldMultitrackSection, newMultitrackSection);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CourseDetailPage/index.jsx", content);
console.log("Updated multitrack display to match TutorialPage pattern!");
