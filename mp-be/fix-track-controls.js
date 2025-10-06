const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", "utf8");

// Update track controls to be more compact and professional
const oldTrackSection = `      {/* Audio Mixing Console */}
      {ready && (
        <Zoom in={ready}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: \`"\\""\`,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                zIndex: 0,
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  mb: 3,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                Audio Mixing Console
              </Typography>

              <Stack
                direction="row"
                spacing={3}
                sx={{
                  justifyContent: "center",
                  overflowX: "auto",
                  pb: 2,
                }}
              >`;

const newTrackSection = `      {/* Professional Track Controls - Compact & Modern */}
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

content = content.replace(oldTrackSection, newTrackSection);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", content);
console.log("✅ Updated track controls section with professional design!");
