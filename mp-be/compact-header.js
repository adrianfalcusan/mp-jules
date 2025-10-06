const fs = require("fs");
let content = fs.readFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", "utf8");

// Complete redesign for ultra-compact, professional look
const oldRender = `  return (
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

const newRender = `  return (
    <Box sx={{ mt: 3 }}>
      {/* Ultra-Compact Professional Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          borderRadius: 2,
          p: 1.5,
          mb: 1.5,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              }}
            >
              <GraphicEq sx={{ color: "white", fontSize: 16 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Multitrack Studio
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "0.7rem",
                }}
              >
                {stems.length} tracks • Professional mixing
              </Typography>
            </Box>
          </Stack>

          <Chip
            label="PRO"
            size="small"
            sx={{
              background: "#10b981",
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        </Box>
      </Paper>`;

content = content.replace(oldRender, newRender);

fs.writeFileSync("/Users/adrianfalcusan/Projects/AF-Works/music-platform-frontend/src/components/MultiTrackPlayer/index.jsx", content);
console.log("✅ Updated header to ultra-compact professional design!");
