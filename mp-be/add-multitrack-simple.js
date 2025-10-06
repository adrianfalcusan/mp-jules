const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CourseDetailPage/index.jsx", "utf8");

// Add multitrack display after the video player
const oldVideoSection = `                {/* Video Player */}
                {isEnrolled ? (
                  <Box>
                    <ProgressTrackingVideoPlayer
                      src={activeVideo}
                      contentType="course"
                      contentId={courseId}
                      onProgressUpdate={() => {}}
                      style={{
                        borderRadius: 8,
                        display: "block",
                        minHeight: 400,
                      }}
                    />
                    {activeVideo && activeVideo.includes(".mov") && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Format Notice:</strong> This video is in QuickTime (.mov) format. 
                          For better browser compatibility, please upload videos in MP4 format.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <VideoPlayer
                    videoUrl={activeVideo}
                    isEnrolled={isEnrolled}
                    onEnroll={handlePurchase}
                    courseTitle={course?.title}
                    thumbnailUrl={course?.thumbnailUrl}
                  />
                )}`;

const newVideoSection = `                {/* Video Player */}
                {isEnrolled ? (
                  <Box>
                    <ProgressTrackingVideoPlayer
                      src={activeVideo}
                      contentType="course"
                      contentId={courseId}
                      onProgressUpdate={() => {}}
                      style={{
                        borderRadius: 8,
                        display: "block",
                        minHeight: 400,
                      }}
                    />
                    {activeVideo && activeVideo.includes(".mov") && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Format Notice:</strong> This video is in QuickTime (.mov) format. 
                          For better browser compatibility, please upload videos in MP4 format.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <VideoPlayer
                    videoUrl={activeVideo}
                    isEnrolled={isEnrolled}
                    onEnroll={handlePurchase}
                    courseTitle={course?.title}
                    thumbnailUrl={course?.thumbnailUrl}
                  />
                )}

                {/* Multitracks */}
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

content = content.replace(oldVideoSection, newVideoSection);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CourseDetailPage/index.jsx", content);
console.log("Added multitrack display to CourseDetailPage!");
