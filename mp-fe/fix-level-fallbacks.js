const fs = require("fs");

// Fix fallback level values in course detail pages
const files = [
  "src/pages/CourseDetailPage/enhanced-index.jsx",
  "src/pages/CourseDetailPage/index.jsx", 
  "src/pages/CourseDetailPage/enhanced-course-detail.jsx"
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");
    content = content.replace(/course\?\.level \|\| "Beginner"/g, "course?.level || \"beginner\"");
    fs.writeFileSync(file, content);
    console.log("Fixed " + file);
  }
});

// Fix catalog page fallback values
if (fs.existsSync("src/pages/CatalogPage/index.jsx")) {
  let content = fs.readFileSync("src/pages/CatalogPage/index.jsx", "utf8");
  content = content.replace(/course\.level \|\| "Beginner"/g, "course.level || \"beginner\"");
  content = content.replace(/tutorial\.level \|\| "Beginner"/g, "tutorial.level || \"beginner\"");
  fs.writeFileSync("src/pages/CatalogPage/index.jsx", content);
  console.log("Fixed CatalogPage fallback values");
}

console.log("Fixed all level enum fallback values!");
