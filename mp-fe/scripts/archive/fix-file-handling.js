const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Fix the addLesson function to not store file objects directly
const oldAddLesson = `  const addLesson = () => {
    if (currentLesson.title && currentLesson.description) {
      // Process materials for the lesson
      const processedMaterials = {
        multitracks: currentLesson.multitrackFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          file: file // Store the file for upload
        })),
        pdfs: currentLesson.pdfFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          file: file // Store the file for upload
        })),
        resources: currentLesson.resourceFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          file: file // Store the file for upload
        }))
      };

      setCourseData((prev) => ({
        ...prev,
        lessons: [
          ...prev.lessons,
          { 
            ...currentLesson, 
            order: prev.lessons.length + 1,
            materials: processedMaterials
          },
        ],
      }));
      setCurrentLesson({
        title: "",
        description: "",
        videoFile: null,
        duration: "",
        multitrackFiles: [],
        pdfFiles: [],
        resourceFiles: [],
        materials: {
          multitracks: [],
          pdfs: [],
          resources: []
        }
      });
    }
  };`;

const newAddLesson = `  const addLesson = () => {
    if (currentLesson.title && currentLesson.description) {
      // Process materials for the lesson - store metadata only, not file objects
      const processedMaterials = {
        multitracks: currentLesson.multitrackFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          size: file.size,
          lastModified: file.lastModified
        })),
        pdfs: currentLesson.pdfFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          size: file.size,
          lastModified: file.lastModified
        })),
        resources: currentLesson.resourceFiles.map((file, index) => ({
          name: file.name,
          type: "other", // Default type, can be enhanced later
          order: index,
          size: file.size,
          lastModified: file.lastModified
        }))
      };

      setCourseData((prev) => ({
        ...prev,
        lessons: [
          ...prev.lessons,
          { 
            ...currentLesson, 
            order: prev.lessons.length + 1,
            materials: processedMaterials,
            // Store file objects separately for upload processing
            _files: {
              video: currentLesson.videoFile,
              multitracks: currentLesson.multitrackFiles,
              pdfs: currentLesson.pdfFiles,
              resources: currentLesson.resourceFiles
            }
          },
        ],
      }));
      setCurrentLesson({
        title: "",
        description: "",
        videoFile: null,
        duration: "",
        multitrackFiles: [],
        pdfFiles: [],
        resourceFiles: [],
        materials: {
          multitracks: [],
          pdfs: [],
          resources: []
        }
      });
    }
  };`;

content = content.replace(oldAddLesson, newAddLesson);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Fixed addLesson function to handle file objects properly!");
