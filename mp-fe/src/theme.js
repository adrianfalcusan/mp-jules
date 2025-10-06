import { createTheme } from "@mui/material/styles";

// Professional Design System - Music Platform
export const designSystem = {
  brand: {
    name: "MUSICLOUD",
    tagline: "Your Music Learning Journey",
    description: "Professional music education platform",
  },

  colors: {
    primary: {
      500: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    },
    secondary: {
      500: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    },
    background: {
      primary: "#0f172a",
      secondary: "#1e293b",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#e2e8f0",
    },
    surface: {
      border: "rgba(148, 163, 184, 0.1)",
    },
  },

  // Add theme structure expected by components
  background: {
    main: "#0f172a",
    paper: "#1e293b",
    glass: "rgba(30, 41, 59, 0.8)",
    light: "rgba(148, 163, 184, 0.1)",
    lighter: "rgba(148, 163, 184, 0.05)",
  },

  primary: {
    main: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    glow: "0 0 20px rgba(99, 102, 241, 0.3)",
  },

  secondary: {
    main: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  },

  text: {
    primary: "#f8fafc",
    secondary: "#e2e8f0",
    muted: "rgba(148, 163, 184, 0.7)",
  },

  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: designSystem.colors.primary[500],
      contrastText: designSystem.colors.text.primary,
    },
    secondary: {
      main: designSystem.colors.secondary[500],
      contrastText: designSystem.colors.text.primary,
    },
    background: {
      default: designSystem.colors.background.primary,
      paper: designSystem.colors.background.secondary,
    },
    text: {
      primary: designSystem.colors.text.primary,
      secondary: designSystem.colors.text.secondary,
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
        containedPrimary: {
          background: designSystem.colors.primary.gradient,
        },
        containedSecondary: {
          background: designSystem.colors.secondary.gradient,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: designSystem.colors.background.secondary,
          borderRadius: 12,
          border: "1px solid " + designSystem.colors.surface.border,
        },
      },
    },
  },
});

export default theme;
