const fs = require("fs");
let content = fs.readFileSync("index.js", "utf8");

// Increase body parsing limits for very large uploads
const oldBodyLimits = `// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));`;

const newBodyLimits = `// Body parsing middleware for large file uploads
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));`;

content = content.replace(oldBodyLimits, newBodyLimits);

fs.writeFileSync("index.js", content);
console.log("✅ Increased body parsing limits to 100MB for large file uploads!");
