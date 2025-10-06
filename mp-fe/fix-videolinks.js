const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseDetailPage/index.jsx", "utf8");

// Remove the old videoLinks reference in handleRestoreAccess
content = content.replace(
  `        if (resp.data.course?.enrolled || resp.data.course?.purchased) {
          const videoResponse = await axios.get(
            \`\${ENV.API_BASE_URL}/courses/\${courseId}/content\`,
            { headers }
          );
          if (videoResponse.data.success) {
            setVideoLinks(videoResponse.data.videoLinks || []);
          }
        }`,
  `        // Enhanced lesson data is now available directly from course object`
);

fs.writeFileSync("src/pages/CourseDetailPage/index.jsx", content);
console.log("Removed old videoLinks reference!");
