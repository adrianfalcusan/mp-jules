const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Add debugging to video upload process
const oldVideoUpload = `        if (lesson._files?.video) {
          try {
            const videoFormData = new FormData();
            videoFormData.append("video", lesson._files.video);
            const videoResponse = await api.post("/upload/video", videoFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            if (videoResponse.data.success) {
              processedLesson.videoUrl = videoResponse.data.url;
              processedLesson.videoKey = videoResponse.data.key;
            }
          } catch (videoError) {
            console.error("Video upload failed:", videoError);
          }
        }`;

const newVideoUpload = `        if (lesson._files?.video) {
          console.log("Uploading video for lesson:", lesson.title, lesson._files.video);
          try {
            const videoFormData = new FormData();
            videoFormData.append("video", lesson._files.video);
            const videoResponse = await api.post("/upload/video", videoFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Video upload response:", videoResponse.data);
            if (videoResponse.data.success) {
              processedLesson.videoUrl = videoResponse.data.url;
              processedLesson.videoKey = videoResponse.data.key;
              console.log("Video URL set:", processedLesson.videoUrl);
            }
          } catch (videoError) {
            console.error("Video upload failed:", videoError);
          }
        } else {
          console.log("No video file found for lesson:", lesson.title);
        }`;

content = content.replace(oldVideoUpload, newVideoUpload);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Added debugging to video upload process!");
