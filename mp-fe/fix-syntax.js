const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseDetailPage/index.jsx", "utf8");

// Fix the syntax error by removing the stray closing brace
content = content.replace(
  `          // If enrolled, fetch video links
          // Enhanced lesson data is now fetched directly from course object
          }`,
  `          // Enhanced lesson data is now fetched directly from course object`
);

fs.writeFileSync("src/pages/CourseDetailPage/index.jsx", content);
console.log("Fixed syntax error!");
