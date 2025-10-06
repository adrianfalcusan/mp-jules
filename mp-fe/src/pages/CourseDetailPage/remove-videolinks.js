const fs = require("fs");
let content = fs.readFileSync("enhanced-index.jsx", "utf8");

// Remove the old videoLinks state declaration
content = content.replace("const [videoLinks, setVideoLinks] = useState([]);", "// Removed old videoLinks state - now using enhanced lesson logic");

// Remove the videoLinks fetching logic
content = content.replace(/if \(response\.data\.course\.enrolled \|\| response\.data\.course\.purchased\) \{[\s\S]*?setVideoLinks\(videoResponse\.data\.videoLinks \|\| \[\]\);[\s\S]*?\}/g, "// Enhanced lesson data is now fetched directly from course object");

// Remove the other videoLinks fetching logic in handleRestoreAccess
content = content.replace(/if \(resp\.data\.course\?\?enrolled \|\| resp\.data\.course\?\?purchased\) \{[\s\S]*?setVideoLinks\(videoResponse\.data\.videoLinks \|\| \[\]\);[\s\S]*?\}/g, "// Enhanced lesson data is now available directly from course object");

fs.writeFileSync("enhanced-index.jsx", content);
console.log("Removed old videoLinks logic!");
