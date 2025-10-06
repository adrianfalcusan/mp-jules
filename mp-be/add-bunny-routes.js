const fs = require("fs");
let content = fs.readFileSync("index.js", "utf8");

// Add Bunny upload routes import
const oldImports = `const uploadsRoutes = require("./routes/uploads");`;

const newImports = `const uploadsRoutes = require("./routes/uploads");
const bunnyUploadsRoutes = require("./routes/bunny-uploads");`;

content = content.replace(oldImports, newImports);

// Add Bunny upload routes to app
const oldRoutes = `app.use("/api/upload", uploadsRoutes);`;

const newRoutes = `app.use("/api/upload", uploadsRoutes);
app.use("/api/bunny-upload", bunnyUploadsRoutes);`;

content = content.replace(oldRoutes, newRoutes);

fs.writeFileSync("index.js", content);
console.log("Added Bunny CDN upload routes to server!");
