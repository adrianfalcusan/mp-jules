const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Update video upload to use Bunny CDN
const oldVideoUpload = `        if (lesson._files?.video) {
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

const newVideoUpload = `        if (lesson._files?.video) {
          console.log("Uploading video to Bunny CDN for lesson:", lesson.title, lesson._files.video);
          try {
            const videoFormData = new FormData();
            videoFormData.append("video", lesson._files.video);
            const videoResponse = await api.post("/bunny-upload/bunny-video", videoFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Bunny CDN video upload response:", videoResponse.data);
            if (videoResponse.data.success) {
              processedLesson.videoUrl = videoResponse.data.url;
              processedLesson.videoKey = videoResponse.data.key;
              processedLesson.videoProvider = "bunnycdn";
              console.log("Bunny CDN video URL set:", processedLesson.videoUrl);
            }
          } catch (videoError) {
            console.error("Bunny CDN video upload failed:", videoError);
          }
        } else {
          console.log("No video file found for lesson:", lesson.title);
        }`;

content = content.replace(oldVideoUpload, newVideoUpload);

// Update multitrack upload to use Bunny CDN
const oldMultitrackUpload = `        // Upload multitrack files
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
        }`;

const newMultitrackUpload = `        // Upload multitrack files to Bunny CDN
        if (lesson._files?.multitracks?.length > 0) {
          for (let i = 0; i < lesson._files.multitracks.length; i++) {
            try {
              const multitrackFormData = new FormData();
              multitrackFormData.append("audio", lesson._files.multitracks[i]);
              const multitrackResponse = await api.post("/bunny-upload/bunny-audio", multitrackFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (multitrackResponse.data.success) {
                processedLesson.materials.multitracks[i].url = multitrackResponse.data.url;
                processedLesson.materials.multitracks[i].key = multitrackResponse.data.key;
              }
            } catch (multitrackError) {
              console.error("Bunny CDN multitrack upload failed:", multitrackError);
            }
          }
        }`;

content = content.replace(oldMultitrackUpload, newMultitrackUpload);

// Update PDF upload to use Bunny CDN
const oldPdfUpload = `        // Upload PDF files
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
        }`;

const newPdfUpload = `        // Upload PDF files to Bunny CDN
        if (lesson._files?.pdfs?.length > 0) {
          for (let i = 0; i < lesson._files.pdfs.length; i++) {
            try {
              const pdfFormData = new FormData();
              pdfFormData.append("document", lesson._files.pdfs[i]);
              const pdfResponse = await api.post("/bunny-upload/bunny-document", pdfFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (pdfResponse.data.success) {
                processedLesson.materials.pdfs[i].url = pdfResponse.data.url;
                processedLesson.materials.pdfs[i].key = pdfResponse.data.key;
              }
            } catch (pdfError) {
              console.error("Bunny CDN PDF upload failed:", pdfError);
            }
          }
        }`;

content = content.replace(oldPdfUpload, newPdfUpload);

// Update resource upload to use Bunny CDN
const oldResourceUpload = `        // Upload resource files
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
        }`;

const newResourceUpload = `        // Upload resource files to Bunny CDN
        if (lesson._files?.resources?.length > 0) {
          for (let i = 0; i < lesson._files.resources.length; i++) {
            try {
              const resourceFormData = new FormData();
              resourceFormData.append("file", lesson._files.resources[i]);
              const resourceResponse = await api.post("/bunny-upload/bunny-document", resourceFormData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (resourceResponse.data.success) {
                processedLesson.materials.resources[i].url = resourceResponse.data.url;
                processedLesson.materials.resources[i].key = resourceResponse.data.key;
              }
            } catch (resourceError) {
              console.error("Bunny CDN resource upload failed:", resourceError);
            }
          }
        }`;

content = content.replace(oldResourceUpload, newResourceUpload);

// Update thumbnail upload to use Bunny CDN
const oldThumbnailUpload = `      // First upload thumbnail if provided
      let thumbnailKey = "";
      if (courseData.thumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", courseData.thumbnailFile);

        try {
          const response = await api.post("/upload/thumbnail", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (response.data.success) {
            thumbnailKey = response.data.key;
          }
        } catch (uploadError) {
          console.error("Thumbnail upload failed:", uploadError);
          alert("Failed to upload thumbnail. Please try again.");
          return;
        }
      }`;

const newThumbnailUpload = `      // First upload thumbnail to Bunny CDN if provided
      let thumbnailKey = "";
      if (courseData.thumbnailFile) {
        const formData = new FormData();
        formData.append("thumbnail", courseData.thumbnailFile);

        try {
          const response = await api.post("/bunny-upload/bunny-thumbnail", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (response.data.success) {
            thumbnailKey = response.data.key;
          }
        } catch (uploadError) {
          console.error("Bunny CDN thumbnail upload failed:", uploadError);
          alert("Failed to upload thumbnail to Bunny CDN. Please try again.");
          return;
        }
      }`;

content = content.replace(oldThumbnailUpload, newThumbnailUpload);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Updated course creation to use Bunny CDN for all uploads!");
