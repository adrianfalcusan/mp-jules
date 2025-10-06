import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";

const CTASection = ({ onShowSignup, onShowLogin }) => {
  return (
    <Box
      component="section"
      sx={{
        py: 28,
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#FFFFFF" }}
        >
          Ești pregătit să îți începi călătoria muzicală?
        </Typography>

        <Typography
          variant="body1"
          sx={{
            maxWidth: 600,
            mx: "auto",
            mb: 4,
            color: "#FFFFFFF",
          }}
        >
          Începe astăzi cu <strong>MUSICLOUD</strong> și transformă-ți pasiunea
          în măiestrie. Cursurile noastre interactive și instructorii experți te
          vor ghida pas cu pas.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={onShowSignup}
          >
            Începe acum
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={onShowLogin}
          >
            Autentificare
          </Button>
        </Stack>
      </motion.div>
    </Box>
  );
};

export default CTASection;
