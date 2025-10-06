const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Enhance the currentLesson state to include multitrack and material uploads
const oldCurrentLesson = `const [currentLesson, setCurrentLesson] = useState({
    title: "",
    description: "",
    videoFile: null,
    duration: "",
  });`;

const newCurrentLesson = `const [currentLesson, setCurrentLesson] = useState({
    title: "",
    description: "",
    videoFile: null,
    duration: "",
    // Enhanced material uploads
    multitrackFiles: [],
    pdfFiles: [],
    resourceFiles: [],
    // Material metadata
    materials: {
      multitracks: [],
      pdfs: [],
      resources: []
    }
  });`;

content = content.replace(oldCurrentLesson, newCurrentLesson);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Enhanced currentLesson state with material uploads!");
