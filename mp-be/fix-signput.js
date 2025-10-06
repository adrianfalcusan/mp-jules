const fs = require('fs');
let content = fs.readFileSync('routes/tutorials.js', 'utf8');
content = content.replace(/const url = await signPut\(key, contentType\);/g, '// AWS signPut removed - deprecated route');
content = content.replace(/res\.json\({ success: true, presignedUrl: url, s3Key: key }\);/g, 'res.status(410).json({ success: false, message: \
This
upload
method
is
deprecated.
Use
/api/content/tutorial/create-with-video\ });');
fs.writeFileSync('routes/tutorials.js', content);
console.log('Fixed tutorials.js');
