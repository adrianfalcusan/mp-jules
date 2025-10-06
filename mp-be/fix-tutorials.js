const fs = require('fs');
let content = fs.readFileSync('routes/tutorials.js', 'utf8');
// Remove lines containing signPut
content = content.split('\\n').filter(line => !line.includes('signPut')).join('\\n');
// Remove the problematic upload routes section
content = content.replace(/\/\* ==.*PRESIGNED UPLOAD HELPERS.*== \*\/[\s\S]*?router\.post\([^}]*\}\);/g, '');
fs.writeFileSync('routes/tutorials.js', content);
console.log('✅ Fixed tutorials.js');
