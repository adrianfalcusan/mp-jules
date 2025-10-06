const fs = require("fs");
const path = require("path");

// Create a simple test MP4 file
const testVideoPath = path.join(__dirname, "test-video.mp4");

// Create a minimal valid MP4 file
const minimalMp4 = Buffer.from([
  // ftyp box
  0x00,
  0x00,
  0x00,
  0x20, // box size (32 bytes)
  0x66,
  0x74,
  0x79,
  0x70, // 'ftyp'
  0x69,
  0x73,
  0x6f,
  0x6d, // major brand 'isom'
  0x00,
  0x00,
  0x02,
  0x00, // minor version
  0x69,
  0x73,
  0x6f,
  0x6d, // compatible brand 'isom'
  0x69,
  0x73,
  0x6f,
  0x32, // compatible brand 'iso2'
  0x6d,
  0x70,
  0x34,
  0x31, // compatible brand 'mp41'

  // mdat box (minimal data)
  0x00,
  0x00,
  0x00,
  0x08, // box size (8 bytes)
  0x6d,
  0x64,
  0x61,
  0x74, // 'mdat'
]);

fs.writeFileSync(testVideoPath, minimalMp4);
console.log("✅ Test video file created:", testVideoPath);
console.log("   Size:", fs.statSync(testVideoPath).size, "bytes");
