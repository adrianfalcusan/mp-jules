const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Add enhanced lesson upload functionality after the description field
const oldAddLessonButton = `                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addLesson}
                    disabled={
                      !currentLesson.title || !currentLesson.description
                    }
                    sx={{
                      background: designSystem.colors.success.gradient,
                      "&:hover": {
                        background: designSystem.colors.success.gradient,
                      },
                      "&:disabled": {
                        background: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Add Lesson
                  </Button>
                </Grid>`;

const newEnhancedSection = `                {/* Video Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                    Lesson Video (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCurrentLesson(prev => ({
                          ...prev,
                          videoFile: file
                        }));
                      }
                    }}
                    style={{ display: "none" }}
                    id="lesson-video-upload"
                  />
                  <label htmlFor="lesson-video-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<VideoLibraryIcon />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      {currentLesson.videoFile ? currentLesson.videoFile.name : "Upload Video"}
                    </Button>
                  </label>
                </Grid>

                {/* Multitrack Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                    Multitrack Files (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setCurrentLesson(prev => ({
                        ...prev,
                        multitrackFiles: [...prev.multitrackFiles, ...files]
                      }));
                    }}
                    style={{ display: "none" }}
                    id="lesson-multitrack-upload"
                  />
                  <label htmlFor="lesson-multitrack-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<LibraryMusicIcon />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Add Multitracks
                    </Button>
                  </label>
                  {currentLesson.multitrackFiles.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {currentLesson.multitrackFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setCurrentLesson(prev => ({
                              ...prev,
                              multitrackFiles: prev.multitrackFiles.filter((_, i) => i !== index)
                            }));
                          }}
                          sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.1)" }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>

                {/* PDF Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                    PDF Materials (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setCurrentLesson(prev => ({
                        ...prev,
                        pdfFiles: [...prev.pdfFiles, ...files]
                      }));
                    }}
                    style={{ display: "none" }}
                    id="lesson-pdf-upload"
                  />
                  <label htmlFor="lesson-pdf-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PictureAsPdfIcon />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Add PDFs
                    </Button>
                  </label>
                  {currentLesson.pdfFiles.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {currentLesson.pdfFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setCurrentLesson(prev => ({
                              ...prev,
                              pdfFiles: prev.pdfFiles.filter((_, i) => i !== index)
                            }));
                          }}
                          sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.1)" }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>

                {/* Resource Upload Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1 }}>
                    Additional Resources (Optional)
                  </Typography>
                  <input
                    type="file"
                    accept="*/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setCurrentLesson(prev => ({
                        ...prev,
                        resourceFiles: [...prev.resourceFiles, ...files]
                      }));
                    }}
                    style={{ display: "none" }}
                    id="lesson-resource-upload"
                  />
                  <label htmlFor="lesson-resource-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFileIcon />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "white",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Add Resources
                    </Button>
                  </label>
                  {currentLesson.resourceFiles.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {currentLesson.resourceFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => {
                            setCurrentLesson(prev => ({
                              ...prev,
                              resourceFiles: prev.resourceFiles.filter((_, i) => i !== index)
                            }));
                          }}
                          sx={{ mr: 1, mb: 1, background: "rgba(255,255,255,0.1)" }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addLesson}
                    disabled={
                      !currentLesson.title || !currentLesson.description
                    }
                    sx={{
                      background: designSystem.colors.success.gradient,
                      "&:hover": {
                        background: designSystem.colors.success.gradient,
                      },
                      "&:disabled": {
                        background: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Add Lesson
                  </Button>
                </Grid>`;

content = content.replace(oldAddLessonButton, newEnhancedSection);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Enhanced lesson form with video and material uploads!");
