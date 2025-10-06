const fs = require("fs");
let content = fs.readFileSync("routes/courses.js", "utf8");

// Replace the old PUT route with enhanced version that handles lessons
const oldPutFields = `[
      "title",
      "description",
      "price",
      "image",
      "videoLinks",
      "thumbnail",
    ].forEach((f) => {
      if (req.body[f] !== undefined) course[f] = req.body[f];
    });`;

const newPutFields = `[
      "title",
      "description", 
      "price",
      "level",
      "category",
      "tags",
      "requirements",
      "learningOutcomes",
      "lessons", // Enhanced lesson support
      "status",
      "image",
      "videoLinks", // Backward compatibility
      "thumbnail",
    ].forEach((f) => {
      if (req.body[f] !== undefined) course[f] = req.body[f];
    });`;

content = content.replace(oldPutFields, newPutFields);

fs.writeFileSync("routes/courses.js", content);
console.log("Enhanced backend course update route!");
