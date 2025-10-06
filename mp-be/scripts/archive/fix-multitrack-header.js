const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", "utf8");

// Replace the entire render section with a professional, compact design
const oldRender = `  return (
    <Box sx={{ mt: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          p: 3,
          mb: 3,
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
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <GraphicEq sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Multitrack Studio
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  opacity: 0.9,
                }}
              >
                Professional audio mixing experience
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Chip
              icon={<MusicNote />}
              label={\`\${stems.length} Tracks\`}
              sx={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                backdropFilter: "blur(10px)",
                "& .MuiChip-icon": { color: "white" },
              }}
            />
            <Chip
              icon={<Equalizer />}
              label="High Quality"
              sx={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                backdropFilter: "blur(10px)",
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          </Stack>
        </Box>
      </Paper>`;

const newRender = `  return (
    <Box sx={{ mt: 4 }}>
      {/* Professional Header - Clean & Modern */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          borderRadius: 2,
          p: 2.5,
          mb: 2,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              }}
            >
              <GraphicEq sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                Multitrack Studio
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontSize: "0.8rem",
                }}
              >
                Professional audio mixing • {stems.length} tracks
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label="Studio"
              size="small"
              sx={{
                background: "#3b82f6",
                color: "white",
                fontWeight: 500,
              }}
            />
          </Stack>
        </Box>
      </Paper>`;

content = content.replace(oldRender, newRender);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", content);
console.log("✅ Updated MultiTrackPlayer header with professional design!");
