import React from "react";
import { Snackbar, Alert } from "@mui/material";
import PropTypes from "prop-types";

export default function Toast({
  open,
  onClose,
  message,
  severity = "info",
  autoHideDuration = 3000,
}) {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

Toast.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  message: PropTypes.string,
  severity: PropTypes.oneOf(["success", "info", "warning", "error"]),
  autoHideDuration: PropTypes.number,
};
