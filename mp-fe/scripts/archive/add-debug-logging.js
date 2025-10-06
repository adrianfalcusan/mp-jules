const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseDetailPage/index.jsx", "utf8");

// Add debugging to see what video URLs are available
const oldActiveVideo = `  const activeLesson = lessons[activeLessonIndex];
  const activeVideo = activeLesson?.videoUrl || activeLesson?.url;`;

const newActiveVideo = `  const activeLesson = lessons[activeLessonIndex];
  const activeVideo = activeLesson?.videoUrl || activeLesson?.url;
  
  // Debug logging
  console.log("Course Detail Debug:", {
    course: course,
    lessons: lessons,
    activeLessonIndex: activeLessonIndex,
    activeLesson: activeLesson,
    activeVideo: activeVideo
  });`;

content = content.replace(oldActiveVideo, newActiveVideo);

fs.writeFileSync("src/pages/CourseDetailPage/index.jsx", content);
console.log("Added debugging to course detail page!");
