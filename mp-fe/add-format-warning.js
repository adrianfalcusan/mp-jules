const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseDetailPage/index.jsx", "utf8");

// Add a fallback video player component for better format support
const oldVideoPlayer = `                {/* Video Player */}
                {isEnrolled ? (
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
                ) : (`;

const newVideoPlayer = `                {/* Video Player */}
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
                ) : (`;

content = content.replace(oldVideoPlayer, newVideoPlayer);

fs.writeFileSync("src/pages/CourseDetailPage/index.jsx", content);
console.log("Added format warning to course detail page!");
