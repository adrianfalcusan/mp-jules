import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6366f1", // Indigo
      contrastText: "#fff",
    },
    secondary: {
      main: "#f59e0b", // Amber
      contrastText: "#fff",
    },
    background: {
      default: "#0f172a", // Dark slate background
      paper: "#1e293b", // Slate paper background
    },
    text: {
      primary: "#f8fafc", // Light slate text
      secondary: "#cbd5e1", // Secondary slate text
    },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e293b",
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
        containedSecondary: {
          backgroundColor: "#f59e0b",
          "&:hover": { backgroundColor: "#d97706" },
        },
        containedPrimary: {
          backgroundColor: "#6366f1",
          "&:hover": { backgroundColor: "#4f46e5" },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorSecondary: {
          backgroundColor: "#f59e0b",
          color: "#fff",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e293b",
          borderRadius: 12,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
  },
});

// Design system constants
export const designSystem = {
  colors: {
    primary: {
      50: "#f0f4ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      gradientHover: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
      gradientVibrant:
        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
    },
    secondary: {
      50: "#fefce8",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    },
    background: {
      primary: "#0f172a",
      secondary: "#1e293b",
    },
    surface: {
      border: "rgba(148, 163, 184, 0.1)",
      borderBright: "rgba(148, 163, 184, 0.2)",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#e2e8f0",
      muted: "#94a3b8",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    xxl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  animations: {
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
};

export default theme;
