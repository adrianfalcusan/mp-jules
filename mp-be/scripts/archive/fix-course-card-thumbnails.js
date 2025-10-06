const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/CourseCard/index.jsx", "utf8");

// Fix the CourseCard thumbnail handling
const oldImageUrl = `  const { _id, title = "Untitled Course", thumbnailUrl, image, isNew } = course;
  const imageUrl = thumbnailUrl || image || "/assets/course-fallback.jpg";`;

const newImageUrl = `  const { _id, title = "Untitled Course", thumbnailUrl, image, thumbnailKey, isNew } = course;
  const imageUrl = thumbnailUrl || 
                  image || 
                  (thumbnailKey ? \`http://localhost:8080/uploads/\${thumbnailKey}\` : null) || 
                  "/assets/course-fallback.jpg";`;

content = content.replace(oldImageUrl, newImageUrl);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/CourseCard/index.jsx", content);
console.log("Fixed CourseCard thumbnail handling!");
