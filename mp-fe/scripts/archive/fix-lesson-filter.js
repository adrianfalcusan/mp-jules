const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseDetailPage/index.jsx", "utf8");

// Fix the lesson filter to show all lessons regardless of isPublished status
const oldFilter = `      return course.lessons
        .filter(lesson => lesson.isPublished !== false || lesson.isPublished === undefined)
        .sort((a, b) => (a.order || 0) - (b.order || 0))`;

const newFilter = `      return course.lessons
        // Show all lessons regardless of isPublished status
        .sort((a, b) => (a.order || 0) - (b.order || 0))`;

content = content.replace(oldFilter, newFilter);

fs.writeFileSync("src/pages/CourseDetailPage/index.jsx", content);
console.log("Fixed lesson filter to show all lessons!");
