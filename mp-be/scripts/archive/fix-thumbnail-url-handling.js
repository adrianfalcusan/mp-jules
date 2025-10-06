const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CatalogPage/index.jsx", "utf8");

// Fix thumbnail URL handling to properly support Bunny CDN URLs
const oldGetThumbnailUrl = `  const getThumbnailUrl = (item) => {
    // Check multiple possible thumbnail fields
    const thumbnailUrl = item.thumbnailUrl || 
                        item.thumbnail || 
                        item.image || 
                        item.thumbnailKey ? \`http://localhost:8080/uploads/\${item.thumbnailKey}\` : null;
    
    return thumbnailUrl || "/assets/course-fallback.jpg";
  };`;

const newGetThumbnailUrl = `  const getThumbnailUrl = (item) => {
    // Check multiple possible thumbnail fields
    // 1. Direct thumbnail URL (should be Bunny CDN URL)
    if (item.thumbnailUrl) {
      return item.thumbnailUrl;
    }

    // 2. Legacy thumbnail field
    if (item.thumbnail) {
      return item.thumbnail;
    }

    // 3. Legacy image field
    if (item.image) {
      return item.image;
    }

    // 4. Construct local URL from thumbnailKey (fallback)
    if (item.thumbnailKey) {
      return \`http://localhost:8080/uploads/\${item.thumbnailKey}\`;
    }

    // 5. Default fallback
    return "/assets/course-fallback.jpg";
  };`;

content = content.replace(oldGetThumbnailUrl, newGetThumbnailUrl);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CatalogPage/index.jsx", content);
console.log("✅ Fixed thumbnail URL handling to properly support Bunny CDN URLs!");
