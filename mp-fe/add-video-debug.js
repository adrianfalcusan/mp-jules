const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseDetailPage/index.jsx", "utf8");

// Add more detailed debugging for video sources
const oldDebugLog = `  // Debug logging
  console.log("Course Detail Debug:", {
    course: course,
    lessons: lessons,
    activeLessonIndex: activeLessonIndex,
    activeLesson: activeLesson,
    activeVideo: activeVideo
  });`;

const newDebugLog = `  // Debug logging
  console.log("Course Detail Debug:", {
    course: course,
    lessons: lessons,
    activeLessonIndex: activeLessonIndex,
    activeLesson: activeLesson,
    activeVideo: activeVideo,
    videoUrl: activeLesson?.videoUrl,
    url: activeLesson?.url
  });
  
  // Additional debugging for video source
  if (activeLesson) {
    console.log("Active Lesson Details:", {
      title: activeLesson.title,
      videoUrl: activeLesson.videoUrl,
      url: activeLesson.url,
      materials: activeLesson.materials
    });
  }`;

content = content.replace(oldDebugLog, newDebugLog);

fs.writeFileSync("src/pages/CourseDetailPage/index.jsx", content);
console.log("Added enhanced debugging for video sources!");
