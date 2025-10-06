const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Add material indicators after the duration
const oldDuration = `                      {lesson.duration && (
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {lesson.duration} minutes
                        </Typography>
                      )}
                    </Box>`;

const newDuration = `                      {lesson.duration && (
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {lesson.duration} minutes
                        </Typography>
                      )}
                      {/* Material Indicators */}
                      <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {lesson.videoFile && (
                          <Chip
                            icon={<VideoLibraryIcon />}
                            label="Video"
                            size="small"
                            sx={{
                              background: "rgba(76, 175, 80, 0.2)",
                              color: "#4CAF50",
                              border: "1px solid rgba(76, 175, 80, 0.3)",
                            }}
                          />
                        )}
                        {lesson.materials?.multitracks?.length > 0 && (
                          <Chip
                            icon={<LibraryMusicIcon />}
                            label={\`\${lesson.materials.multitracks.length} Multitrack\${lesson.materials.multitracks.length > 1 ? "s" : ""}\`}
                            size="small"
                            sx={{
                              background: "rgba(156, 39, 176, 0.2)",
                              color: "#9C27B0",
                              border: "1px solid rgba(156, 39, 176, 0.3)",
                            }}
                          />
                        )}
                        {lesson.materials?.pdfs?.length > 0 && (
                          <Chip
                            icon={<PictureAsPdfIcon />}
                            label={\`\${lesson.materials.pdfs.length} PDF\${lesson.materials.pdfs.length > 1 ? "s" : ""}\`}
                            size="small"
                            sx={{
                              background: "rgba(244, 67, 54, 0.2)",
                              color: "#F44336",
                              border: "1px solid rgba(244, 67, 54, 0.3)",
                            }}
                          />
                        )}
                        {lesson.materials?.resources?.length > 0 && (
                          <Chip
                            icon={<AttachFileIcon />}
                            label={\`\${lesson.materials.resources.length} Resource\${lesson.materials.resources.length > 1 ? "s" : ""}\`}
                            size="small"
                            sx={{
                              background: "rgba(255, 152, 0, 0.2)",
                              color: "#FF9800",
                              border: "1px solid rgba(255, 152, 0, 0.3)",
                            }}
                          />
                        )}
                      </Box>
                    </Box>`;

content = content.replace(oldDuration, newDuration);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Enhanced lesson display with material indicators!");
