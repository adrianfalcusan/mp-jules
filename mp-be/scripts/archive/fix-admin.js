const fs = require("fs");
let content = fs.readFileSync("routes/admin-approval.js", "utf8");

// Fix template literal escape issues
content = content.replace(/\\`Course .*\\`/g, "`Course ${course.title}`");
content = content.replace(/\\`Tutorial .*\\`/g, "`Tutorial ${tutorial.title}`");
content = content.replace(/\\`\\${type\\.charAt\\(0\\)\\.toUpperCase\\(\\) \\+ type\\.slice\\(1\\)} .*\\`/g, "`${type.charAt(0).toUpperCase() + type.slice(1)} ${item.title}`");

// Fix any remaining escape issues
content = content.replace(/\\\\/g, "\\\\");

fs.writeFileSync("routes/admin-approval.js", content);
console.log("✅ Fixed admin-approval.js syntax errors");
