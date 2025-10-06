// src/components/ConstrainedSection/index.jsx
import React from "react";
import PropTypes from "prop-types";
import { Container } from "@mui/material";

const ConstrainedSection = ({ children, sx, ...props }) => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 8,
        minHeight: "100vh",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

ConstrainedSection.propTypes = {
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
};

export default React.memo(ConstrainedSection);
