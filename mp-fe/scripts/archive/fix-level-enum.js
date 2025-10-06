const fs = require("fs");
let content = fs.readFileSync("src/pages/CourseCreatePage/index.jsx", "utf8");

// Fix the level enum values to match backend expectations
const oldLevelOptions = `                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>`;

const newLevelOptions = `                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>`;

content = content.replace(oldLevelOptions, newLevelOptions);

// Also fix the default value
content = content.replace(`level: "Beginner",`, `level: "beginner",`);

fs.writeFileSync("src/pages/CourseCreatePage/index.jsx", content);
console.log("Fixed level enum values to match backend expectations!");
