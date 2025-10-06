const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", "utf8");

// Make track controls ultra-compact and modern
const oldTrackSection = `      {/* Professional Track Controls - Compact & Modern */}
      {ready && (
        <Zoom in={ready}>
          <Paper
            elevation={0}
            sx={{
              background: "#ffffff",
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#1e293b",
                  mb: 3,
                  fontWeight: 600,
                  fontSize: "1rem",
                  textAlign: "center",
                }}
              >
                Track Controls
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                sx={{
                  overflowX: "auto",
                  pb: 1,
                  px: 1,
                }}
                className="track-controls-scroll"
              >`;

const newTrackSection = `      {/* Ultra-Compact Track Mixer */}
      {ready && (
        <Zoom in={ready}>
          <Box
            sx={{
              background: "rgba(30, 41, 59, 0.9)",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "white",
                  mb: 2,
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Track Mixer
              </Typography>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  overflowX: "auto",
                  pb: 1,
                  px: 0.5,
                }}
                className="track-controls-scroll"
              >`;

content = content.replace(oldTrackSection, newTrackSection);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", content);
console.log("✅ Updated track controls section to ultra-compact modern design!");
