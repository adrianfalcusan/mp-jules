const fs = require("fs");
let content = fs.readFileSync("enhanced-index.jsx", "utf8");

// Replace the ListItemText secondary prop with enhanced version that shows material indicators
const oldSecondary = `secondary={lesson.duration}`;
const newSecondary = `secondary={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="caption">
                                  {lesson.duration ? \`\${lesson.duration}\` : "5-8 min"}
                                </Typography>
                                {lesson.materials?.multitracks?.length > 0 && (
                                  <MultitrackIcon sx={{ fontSize: 14 }} />
                                )}
                                {lesson.materials?.pdfs?.length > 0 && (
                                  <PdfIcon sx={{ fontSize: 14 }} />
                                )}
                                {lesson.materials?.resources?.length > 0 && (
                                  <ResourceIcon sx={{ fontSize: 14 }} />
                                )}
                              </Box>
                            }`;

content = content.replace(oldSecondary, newSecondary);

fs.writeFileSync("enhanced-index.jsx", content);
console.log("Enhanced LessonsList with material indicators!");
