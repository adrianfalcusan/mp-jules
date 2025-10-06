const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CourseDetailPage/index.jsx", "utf8");

// Import MultiTrackPlayer component
const oldImports = `import ProgressTrackingVideoPlayer from "../../components/ProgressTrackingVideoPlayer";`;

const newImports = `import ProgressTrackingVideoPlayer from "../../components/ProgressTrackingVideoPlayer";
import MultiTrackPlayer from "../../components/MultiTrackPlayer";`;

content = content.replace(oldImports, newImports);

// Replace the multitrack section with MultiTrackPlayer
const oldMultitrackSection = `                {/* Multitracks */}
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

const newMultitrackSection = `                {/* Multitrack Studio */}
                {isEnrolled && activeLesson?.materials?.multitracks?.length > 0 && (
                  <MultiTrackPlayer tracks={activeLesson.materials.multitracks} />
                )}`;

content = content.replace(oldMultitrackSection, newMultitrackSection);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CourseDetailPage/index.jsx", content);
console.log("Replaced with MultiTrackPlayer component!");
