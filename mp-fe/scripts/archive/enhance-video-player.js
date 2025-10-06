const fs = require("fs");
let content = fs.readFileSync("src/components/ProgressTrackingVideoPlayer/index.jsx", "utf8");

// Add better error handling and format support
const oldVideoElement = `      <video
        ref={videoRef}
        src={src}
        controls
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          ...props.style,
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}`;

const newVideoElement = `      <video
        ref={videoRef}
        src={src}
        controls
        preload="metadata"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          ...props.style,
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onError={(e) => {
          console.error("Video playback error:", e);
          console.error("Video source:", src);
          console.error("Video format not supported. Please use MP4 format for better browser compatibility.");
        }}`;

content = content.replace(oldVideoElement, newVideoElement);

// Add format warning for unsupported formats
const oldNoSourceMessage = `        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "#f5f5f5",
            borderRadius: "8px",
            ...props.style,
          }}
        >
          <p>No video source available</p>
        </div>`;

const newNoSourceMessage = `        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "#f5f5f5",
            borderRadius: "8px",
            ...props.style,
          }}
        >
          <p>No video source available</p>
          {src && src.includes(".mov") && (
            <p style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "10px" }}>
              ⚠️ QuickTime (.mov) format detected. For better compatibility, please use MP4 format.
            </p>
          )}
        </div>`;

content = content.replace(oldNoSourceMessage, newNoSourceMessage);

fs.writeFileSync("src/components/ProgressTrackingVideoPlayer/index.jsx", content);
console.log("Enhanced video player with better error handling and format warnings!");
