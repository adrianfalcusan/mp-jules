const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Add missing imports for the enhanced lesson form
const oldImports = `import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  School as CourseIcon,
  VideoLibrary as VideoIcon,
  AttachMoney as PriceIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Preview as PreviewIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";`;

const newImports = `import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  School as CourseIcon,
  VideoLibrary as VideoIcon,
  VideoLibrary as VideoLibraryIcon,
  LibraryMusic as LibraryMusicIcon,
  PictureAsPdf as PictureAsPdfIcon,
  AttachFile as AttachFileIcon,
  AttachMoney as PriceIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Preview as PreviewIcon,
  AudioFile as AudioIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";`;

content = content.replace(oldImports, newImports);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Added missing imports for enhanced lesson form!");
