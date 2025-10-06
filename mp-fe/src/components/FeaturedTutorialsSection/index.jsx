import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import AnimatedSection from "../AnimatedSection";
import TutorialCard from "../TutorialCard";

export default function FeaturedTutorialsSection({ tutorials, loading }) {
  return (
    <AnimatedSection delay={0.4}>
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Tutoriale recomandate
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4, opacity: 0.7 }}>
          Ghiduri rapide alese de experții noștri.
        </Typography>

        {loading ? (
          <Typography align="center">Loading tutorials…</Typography>
        ) : (
          <Box sx={{ py: 6 }}>
            <Grid container spacing={4} justifyContent="center">
              {tutorials.map((t) => (
                <Grid item key={t._id} xs={12} sm={6} md={4} lg={3}>
                  <TutorialCard tutorial={t} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </AnimatedSection>
  );
}
