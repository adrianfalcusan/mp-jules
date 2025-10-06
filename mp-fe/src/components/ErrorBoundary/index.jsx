import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  Alert,
  Container,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "../../utils/constants";
import ENV from "../../config/environment";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("Error caught by boundary:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_CONFIG.DURATION.NORMAL }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  color: "error.main",
                  fontWeight: "bold",
                  mb: 2,
                }}
              >
                Oops! Something went wrong
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {this.props.message ||
                  "We encountered an unexpected error. Please try again or contact support if the problem persists."}
              </Typography>

              {ENV.IS_DEVELOPMENT && this.state.error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    textAlign: "left",
                    "& .MuiAlert-message": {
                      overflow: "auto",
                    },
                  }}
                >
                  <Typography variant="body2" component="div">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        mt: 1,
                        fontSize: "0.75rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Alert>
              )}

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleRetry}
                  sx={{
                    minWidth: 120,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Try Again
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => (window.location.href = "/")}
                  sx={{
                    minWidth: 120,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Go Home
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  message: PropTypes.string,
  onError: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  fallback: null,
  message: null,
  onError: null,
};

export default ErrorBoundary;
