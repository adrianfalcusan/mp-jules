const fs = require("fs");
const content = fs.readFileSync("enhanced-index.jsx", "utf8");
const lines = content.split("\n");

// Enhanced section to replace lines 707-735
const newSection = [
  "  const [state, setState] = useState({",
  "    course: null,",
  "    loading: true,",
  "    error: null,",
  "    purchasing: false,",
  "    activeLessonIndex: 0, // Changed from activeVideoIndex",
  "    finishing: false,",
  "  });",
  "",
  "  const { course, loading, error, purchasing, activeLessonIndex, finishing } = state;",
  "  const isEnrolled = course?.enrolled || course?.purchased;",
  "",
  "  // Enhanced lesson data handling - use real lesson data from course object",
  "  const lessons = React.useMemo(() => {",
  "    if (course?.lessons && course.lessons.length > 0) {",
  "      // Use real lesson data from the course",
  "      return course.lessons",
  "        .filter(lesson => lesson.isPublished !== false)",
  "        .sort((a, b) => (a.order || 0) - (b.order || 0))",
  "        .map(lesson => ({",
  "          ...lesson,",
  "          url: lesson.videoUrl,",
  "          title: lesson.title || \`Lesson \${lesson.order || 1}\`,",
  "          duration: lesson.duration ? \`\${lesson.duration} min\` : \"5-8 min\",",
  "        }));",
  "    } else if (course?.videoLinks && course.videoLinks.length > 0) {",
  "      // Fallback to old videoLinks format for backward compatibility",
  "      return course.videoLinks.map((link, index) => ({",
  "        url: link,",
  "        title: \`Lesson \${index + 1}\`,",
  "        duration: \"5-8 min\",",
  "        videoUrl: link,",
  "      }));",
  "    }",
  "    return [];",
  "  }, [course]);",
  "",
  "  const activeLesson = lessons[activeLessonIndex];",
  "  const activeVideo = activeLesson?.videoUrl || activeLesson?.url;",
  "",
  "  const progress = isEnrolled && lessons.length > 0",
  "    ? ((activeLessonIndex + 1) / lessons.length) * 100",
  "    : 0;",
  ""
];

// Replace lines 707-735 (0-indexed: 706-734)
const beforeSection = lines.slice(0, 707);
const afterSection = lines.slice(735);
const newContent = [...beforeSection, ...newSection, ...afterSection].join("\n");

fs.writeFileSync("enhanced-index.jsx", newContent);
console.log("Enhanced version created successfully!");
