import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandIcon,
  BugReport as BugIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { designSystem } from "../../../theme";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service (e.g., Sentry)
    if (typeof this.props.onError === "function") {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleToggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Here you would send the error report to your bug tracking system
    console.log("Error report:", errorReport);

    // For now, copy to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert(
          "Error report copied to clipboard. Please share this with our support team."
        );
      })
      .catch(() => {
        alert(
          "Unable to copy error report. Please take a screenshot and contact support."
        );
      });
  };

  render() {
    const { hasError, error, errorInfo, showDetails, retryCount } = this.state;
    const {
      fallback,
      children,
      title = "Something went wrong",
      description = "We're sorry, but an unexpected error occurred. Please try refreshing the page.",
      showRetry = true,
      showGoHome = true,
      showBugReport = true,
      maxRetries = 3,
    } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return typeof fallback === "function"
          ? fallback(error, this.handleRetry, this.handleGoHome)
          : fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            background: `linear-gradient(135deg, ${designSystem.colors.background.primary} 0%, ${designSystem.colors.background.secondary} 100%)`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%", maxWidth: 600 }}
          >
            <Card
              elevation={0}
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${designSystem.colors.surface.border}`,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3} alignItems="center" textAlign="center">
                  {/* Error Icon */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 25px rgba(238, 90, 82, 0.3)",
                    }}
                  >
                    <ErrorIcon sx={{ fontSize: 40, color: "white" }} />
                  </Box>

                  {/* Error Message */}
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: designSystem.colors.text.primary,
                        mb: 1,
                      }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: designSystem.colors.text.secondary,
                        lineHeight: 1.6,
                        maxWidth: 400,
                        mx: "auto",
                      }}
                    >
                      {description}
                    </Typography>
                  </Box>

                  {/* Retry Information */}
                  {retryCount > 0 && (
                    <Alert
                      severity="info"
                      sx={{
                        background: "rgba(33, 150, 243, 0.1)",
                        border: "1px solid rgba(33, 150, 243, 0.3)",
                      }}
                    >
                      You've tried {retryCount} time{retryCount > 1 ? "s" : ""}.
                      {retryCount >= maxRetries &&
                        " Please contact support if the issue persists."}
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ width: "100%" }}
                  >
                    {showRetry && retryCount < maxRetries && (
                      <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={this.handleRetry}
                        sx={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          py: 1.5,
                          fontWeight: 600,
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Try Again
                      </Button>
                    )}

                    {showGoHome && (
                      <Button
                        variant="outlined"
                        startIcon={<HomeIcon />}
                        onClick={this.handleGoHome}
                        sx={{
                          borderColor: designSystem.colors.surface.border,
                          color: designSystem.colors.text.secondary,
                          py: 1.5,
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: designSystem.colors.primary[500],
                            color: designSystem.colors.primary[400],
                            background: "rgba(102, 126, 234, 0.1)",
                          },
                        }}
                      >
                        Go to Home
                      </Button>
                    )}
                  </Stack>

                  {/* Error Details Toggle */}
                  {(error || errorInfo) && (
                    <Box sx={{ width: "100%" }}>
                      <Button
                        onClick={this.handleToggleDetails}
                        startIcon={
                          <ExpandIcon
                            sx={{
                              transform: showDetails
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        }
                        sx={{
                          color: designSystem.colors.text.muted,
                          fontSize: "0.875rem",
                          textTransform: "none",
                        }}
                      >
                        {showDetails ? "Hide" : "Show"} Error Details
                      </Button>

                      <Collapse in={showDetails}>
                        <Box sx={{ mt: 2, textAlign: "left" }}>
                          <Alert
                            severity="error"
                            sx={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              "& .MuiAlert-message": {
                                width: "100%",
                              },
                            }}
                            action={
                              showBugReport && (
                                <IconButton
                                  onClick={this.handleReportBug}
                                  size="small"
                                  sx={{ color: "inherit" }}
                                  title="Report this bug"
                                >
                                  <BugIcon fontSize="small" />
                                </IconButton>
                              )
                            }
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "monospace", mb: 1 }}
                            >
                              <strong>Error:</strong> {error?.toString()}
                            </Typography>
                            {error?.stack && (
                              <Typography
                                variant="caption"
                                component="pre"
                                sx={{
                                  fontFamily: "monospace",
                                  whiteSpace: "pre-wrap",
                                  maxHeight: 200,
                                  overflow: "auto",
                                  background: "rgba(0, 0, 0, 0.3)",
                                  p: 1,
                                  borderRadius: 1,
                                  fontSize: "0.7rem",
                                }}
                              >
                                {error.stack}
                              </Typography>
                            )}
                          </Alert>
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  showRetry: PropTypes.bool,
  showGoHome: PropTypes.bool,
  showBugReport: PropTypes.bool,
  maxRetries: PropTypes.number,
};

// Higher-order component for easy wrapping
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

// Hook for handling async errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    console.error("Async error caught:", error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
};

export default ErrorBoundary;
