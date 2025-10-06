const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Fix video upload to extract only the URL from Bunny CDN response
const oldVideoUpload = `            console.log("Bunny CDN video upload response:", videoResponse.data);
            if (videoResponse.data.success) {
              processedLesson.videoUrl = videoResponse.data.url;
              processedLesson.videoKey = videoResponse.data.key;
              processedLesson.videoProvider = "bunnycdn";
              console.log("Bunny CDN video URL set:", processedLesson.videoUrl);
            }`;

const newVideoUpload = `            console.log("Bunny CDN video upload response:", videoResponse.data);
            if (videoResponse.data.success) {
              // Extract only the URL from the Bunny CDN response object
              processedLesson.videoUrl = videoResponse.data.url;
              processedLesson.videoKey = videoResponse.data.fileName;
              processedLesson.videoProvider = "bunnycdn";
              console.log("Bunny CDN video URL set:", processedLesson.videoUrl);
            }`;

content = content.replace(oldVideoUpload, newVideoUpload);

// Fix multitrack upload to extract only the URL from Bunny CDN response
const oldMultitrackUpload = `              if (multitrackResponse.data.success) {
                processedLesson.materials.multitracks[i].url = multitrackResponse.data.url;
                processedLesson.materials.multitracks[i].key = multitrackResponse.data.key;
              }`;

const newMultitrackUpload = `              if (multitrackResponse.data.success) {
                // Extract only the URL from the Bunny CDN response object
                processedLesson.materials.multitracks[i].url = multitrackResponse.data.url;
                processedLesson.materials.multitracks[i].key = multitrackResponse.data.fileName;
              }`;

content = content.replace(oldMultitrackUpload, newMultitrackUpload);

// Fix PDF upload to extract only the URL from Bunny CDN response
const oldPdfUpload = `              if (pdfResponse.data.success) {
                processedLesson.materials.pdfs[i].url = pdfResponse.data.url;
                processedLesson.materials.pdfs[i].key = pdfResponse.data.key;
              }`;

const newPdfUpload = `              if (pdfResponse.data.success) {
                // Extract only the URL from the Bunny CDN response object
                processedLesson.materials.pdfs[i].url = pdfResponse.data.url;
                processedLesson.materials.pdfs[i].key = pdfResponse.data.fileName;
              }`;

content = content.replace(oldPdfUpload, newPdfUpload);

// Fix resource upload to extract only the URL from Bunny CDN response
const oldResourceUpload = `              if (resourceResponse.data.success) {
                processedLesson.materials.resources[i].url = resourceResponse.data.url;
                processedLesson.materials.resources[i].key = resourceResponse.data.key;
              }`;

const newResourceUpload = `              if (resourceResponse.data.success) {
                // Extract only the URL from the Bunny CDN response object
                processedLesson.materials.resources[i].url = resourceResponse.data.url;
                processedLesson.materials.resources[i].key = resourceResponse.data.fileName;
              }`;

content = content.replace(oldResourceUpload, newResourceUpload);

// Fix thumbnail upload to extract only the key from Bunny CDN response
const oldThumbnailUpload = `          if (response.data.success) {
            thumbnailKey = response.data.key;
          }`;

const newThumbnailUpload = `          if (response.data.success) {
            // Extract only the fileName from the Bunny CDN response object
            thumbnailKey = response.data.fileName;
          }`;

content = content.replace(oldThumbnailUpload, newThumbnailUpload);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Fixed frontend to extract only URLs from Bunny CDN responses!");
