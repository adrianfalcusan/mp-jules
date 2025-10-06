// src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/Routes";
import store from "./store/store";
import { Provider } from "react-redux";
import { ThemeProvider, GlobalStyles } from "@mui/material";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import "./i18n";

const globalStyles = (
  <GlobalStyles
    styles={{
      "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active":
        {
          WebkitBoxShadow: "0 0 0 1000px #1E1E1E inset !important",
          WebkitTextFillColor: "#E0E0E0 !important",
          transition: "background-color 5000s ease-in-out 0s",
        },
      ".MuiOutlinedInput-root:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px #1E1E1E inset !important",
        WebkitTextFillColor: "#E0E0E0 !important",
      },
    }}
  />
);

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        <Provider store={store}>
          <AppRoutes />
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
