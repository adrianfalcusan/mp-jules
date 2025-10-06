const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Enhance saveDraft to handle lesson file uploads
const oldSaveDraft = `      // Prepare course data
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        price: parseFloat(courseData.price) || 0,
        level: courseData.level,
        category: courseData.category,
        tags: courseData.tags,
        requirements: courseData.requirements,
        learningOutcomes: courseData.learningOutcomes,
        lessons: courseData.lessons,
        status: courseData.status,
        thumbnail: thumbnailKey, // Send the uploaded file key, not the file
      };`;

const newSaveDraft = `      // Process lesson files and upload them
      const processedLessons = [];
      
      for (const lesson of courseData.lessons) {
        const processedLesson = {
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          order: lesson.order,
          materials: lesson.materials || { multitracks: [], pdfs: [], resources: [] }
        };

        // Upload video if present
        if (lesson._files?.video) {
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
        }

        // Upload multitrack files
        if (lesson._files?.multitracks?.length > 0) {
          for (let i = 0; i < lesson._files.multitracks.length; i++) {
            try {
              const multitrackFormData = new FormData();
              multitrackFormData.append("audio", lesson._files.multitracks[i]);
              const multitrackResponse = await api.post("/upload/audio", multitrackFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (multitrackResponse.data.success) {
                processedLesson.materials.multitracks[i].url = multitrackResponse.data.url;
                processedLesson.materials.multitracks[i].key = multitrackResponse.data.key;
              }
            } catch (multitrackError) {
              console.error("Multitrack upload failed:", multitrackError);
            }
          }
        }

        // Upload PDF files
        if (lesson._files?.pdfs?.length > 0) {
          for (let i = 0; i < lesson._files.pdfs.length; i++) {
            try {
              const pdfFormData = new FormData();
              pdfFormData.append("document", lesson._files.pdfs[i]);
              const pdfResponse = await api.post("/upload/document", pdfFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (pdfResponse.data.success) {
                processedLesson.materials.pdfs[i].url = pdfResponse.data.url;
                processedLesson.materials.pdfs[i].key = pdfResponse.data.key;
              }
            } catch (pdfError) {
              console.error("PDF upload failed:", pdfError);
            }
          }
        }

        // Upload resource files
        if (lesson._files?.resources?.length > 0) {
          for (let i = 0; i < lesson._files.resources.length; i++) {
            try {
              const resourceFormData = new FormData();
              resourceFormData.append("file", lesson._files.resources[i]);
              const resourceResponse = await api.post("/upload/file", resourceFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (resourceResponse.data.success) {
                processedLesson.materials.resources[i].url = resourceResponse.data.url;
                processedLesson.materials.resources[i].key = resourceResponse.data.key;
              }
            } catch (resourceError) {
              console.error("Resource upload failed:", resourceError);
            }
          }
        }

        processedLessons.push(processedLesson);
      }

      // Prepare course data
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        price: parseFloat(courseData.price) || 0,
        level: courseData.level,
        category: courseData.category,
        tags: courseData.tags,
        requirements: courseData.requirements,
        learningOutcomes: courseData.learningOutcomes,
        lessons: processedLessons, // Use processed lessons with uploaded URLs
        status: courseData.status,
        thumbnail: thumbnailKey, // Send the uploaded file key, not the file
      };`;

content = content.replace(oldSaveDraft, newSaveDraft);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Enhanced saveDraft function to handle lesson file uploads!");
