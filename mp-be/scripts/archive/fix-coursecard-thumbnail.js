const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/CourseCard/index.jsx", "utf8");

// Fix CourseCard thumbnail URL handling
const oldImageUrl = `  const { _id, title = "Untitled Course", thumbnailUrl, image, thumbnailKey, isNew } = course;
  const imageUrl = thumbnailUrl || 
                  image || 
                  (thumbnailKey ? \`http://localhost:8080/uploads/\${thumbnailKey}\` : null) || 
                  "/assets/course-fallback.jpg";`;

const newImageUrl = `  const { _id, title = "Untitled Course", thumbnailUrl, image, thumbnailKey, isNew } = course;

  // Handle thumbnail URLs properly - prioritize Bunny CDN URLs
  let imageUrl = "/assets/course-fallback.jpg";

  if (thumbnailUrl) {
    imageUrl = thumbnailUrl; // Bunny CDN URL
  } else if (image) {
    imageUrl = image; // Legacy field
  } else if (thumbnailKey) {
    imageUrl = \`http://localhost:8080/uploads/\${thumbnailKey}\`; // Local fallback
  }`;

content = content.replace(oldImageUrl, newImageUrl);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/CourseCard/index.jsx", content);
console.log("✅ Fixed CourseCard thumbnail URL handling!");
