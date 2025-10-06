const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Update the addLesson function to handle enhanced material data
const oldAddLesson = `  const addLesson = () => {
    if (currentLesson.title && currentLesson.description) {
      setCourseData((prev) => ({
        ...prev,
        lessons: [
          ...prev.lessons,
          { ...currentLesson, order: prev.lessons.length + 1 },
        ],
      }));
      setCurrentLesson({
        title: "",
        description: "",
        videoFile: null,
        duration: "",
      });
    }
  };`;

const newAddLesson = `  const addLesson = () => {
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

content = content.replace(oldAddLesson, newAddLesson);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Enhanced addLesson function with material processing!");
