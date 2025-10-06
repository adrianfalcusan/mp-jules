import React from "react";
import {
  Box,
  Paper,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";

export default function PurchaseOverlay({
  open,
  text = "Finishing your purchase...",
  showRestore = false,
  onRestore,
}) {
  if (!open) return null;
  return (
    <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 1300 }}>
      <Paper
        elevation={3}
        sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <CircularProgress size={18} />
        <Typography variant="body2">{text}</Typography>
        {showRestore && (
          <Button
            size="small"
            variant="outlined"
            onClick={onRestore}
            sx={{ ml: 1 }}
          >
            Restore Access
          </Button>
        )}
      </Paper>
    </Box>
  );
}

PurchaseOverlay.propTypes = {
  open: PropTypes.bool,
  text: PropTypes.string,
  showRestore: PropTypes.bool,
  onRestore: PropTypes.func,
};
