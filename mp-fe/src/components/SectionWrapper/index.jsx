// src/components/SectionWrapper/index.jsx
import React from "react";
import PropTypes from "prop-types";
import { Box, Container } from "@mui/material";

/* small util – hex » rgba -------------------------------------------------- */
const hexToRgba = (hex, alpha = 1) => {
  if (!/^#([0-9a-f]{3}){1,2}$/i.test(hex)) return hex;
  let c = hex.slice(1).split("");
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  const int = parseInt(c.join(""), 16);
  return `rgba(${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}, ${alpha})`;
};

/* main component ----------------------------------------------------------- */
function SectionWrapper({
  children,
  /* layout */
  fullWidth = false,
  fullHeight = false,
  maxWidth = "xl",
  paddingTop,
  sx = {},
  /* static background (color / image) */
  background,
  backgroundTransparency = 1,
  backgroundFullWidth = false,
  /* video background */
  backgroundVideoSrc,
  backgroundVideoProps = {},
  /* optional overlay */
  overlayColor,
  overlayOpacity = 0,
  ...props
}) {
  /* ---------- base content styles */
  const contentStyles = {
    pt: paddingTop !== undefined ? paddingTop : 8,
    ...(fullHeight && { minHeight: "100vh" }),
    ...sx,
  };

  if (background) {
    if (background.startsWith("#") && backgroundTransparency < 1) {
      contentStyles.background = hexToRgba(background, backgroundTransparency);
    } else if (/^\/|^https?:|^url\(/.test(background)) {
      /* if it's already url(...) or absolute path */
      contentStyles.background = background;
    } else {
      /* assume plain path to image → wrap in url() */
      contentStyles.background = `url(${background}) center/cover no-repeat`;
    }
  }

  /* ---------- choose outer width */
  const rootWidth = fullWidth || backgroundFullWidth ? "100vw" : "100%";

  /* ---------- root */
  return (
    <Box
      sx={{ position: "relative", width: rootWidth, overflow: "hidden" }}
      {...props}
    >
      {/* video bg (below everything) */}
      {backgroundVideoSrc && (
        <Box
          component="video"
          autoPlay
          muted
          loop
          playsInline
          {...backgroundVideoProps}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -4,
            ...backgroundVideoProps.sx,
          }}
        >
          <source src={backgroundVideoSrc} type="video/mp4" />
        </Box>
      )}

      {/* optional overlay */}
      {overlayOpacity > 0 && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: overlayColor?.startsWith("#")
              ? hexToRgba(overlayColor, overlayOpacity)
              : overlayColor || `rgba(0,0,0,${overlayOpacity})`,
            zIndex: -3,
          }}
        />
      )}

      {/* main content */}
      {fullWidth ? (
        <Box sx={contentStyles}>{children}</Box>
      ) : (
        <Container sx={contentStyles}>{children}</Container>
      )}
    </Box>
  );
}

/* prop types for clarity --------------------------------------------------- */
SectionWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
  fullHeight: PropTypes.bool,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  paddingTop: PropTypes.number,
  sx: PropTypes.object,
  background: PropTypes.string,
  backgroundTransparency: PropTypes.number,
  backgroundFullWidth: PropTypes.bool,
  backgroundVideoSrc: PropTypes.string,
  backgroundVideoProps: PropTypes.object,
  overlayColor: PropTypes.string,
  overlayOpacity: PropTypes.number,
};

export default SectionWrapper;
