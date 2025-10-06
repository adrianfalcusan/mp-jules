const fs = require("fs");
let content = fs.readFileSync("index.js", "utf8");

// Comment out problematic tutorials route
content = content.replace(
  `app.use("/api/tutorials", tutorialRoutes);`,
  `// app.use("/api/tutorials", tutorialRoutes); // Temporarily disabled due to AWS signPut errors`
);

// Add new streamlined routes after the route imports
const routeImports = `const tutorialRoutes = require("./routes/tutorials");`;
const newImports = `const tutorialRoutes = require("./routes/tutorials");
const streamlinedContentRoutes = require("./routes/streamlined-content");
const adminApprovalRoutes = require("./routes/admin-approval");`;

content = content.replace(routeImports, newImports);

// Add new route registrations after webhooks
const webhooksRoute = `app.use("/api/webhooks", webhookRoutes);`;
const newRoutes = `app.use("/api/webhooks", webhookRoutes);

// New streamlined routes
app.use("/api/content", streamlinedContentRoutes);
app.use("/api/admin/approval", adminApprovalRoutes);`;

content = content.replace(webhooksRoute, newRoutes);

fs.writeFileSync("index.js", content);
console.log("✅ Updated index.js with new routes");
