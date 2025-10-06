const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CatalogPage/index.jsx", "utf8");

// Fix the getThumbnailUrl function to check more fields
const oldGetThumbnailUrl = `  const getThumbnailUrl = (item) => {
    return (
      item.thumbnailUrl ||
      item.thumbnail ||
      item.image ||
      "/assets/course-fallback.jpg"
    );
  };`;

const newGetThumbnailUrl = `  const getThumbnailUrl = (item) => {
    // Check multiple possible thumbnail fields
    const thumbnailUrl = item.thumbnailUrl || 
                        item.thumbnail || 
                        item.image || 
                        item.thumbnailKey ? \`http://localhost:8080/uploads/\${item.thumbnailKey}\` : null;
    
    return thumbnailUrl || "/assets/course-fallback.jpg";
  };`;

content = content.replace(oldGetThumbnailUrl, newGetThumbnailUrl);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/pages/CatalogPage/index.jsx", content);
console.log("Fixed thumbnail URL handling in CatalogPage!");
