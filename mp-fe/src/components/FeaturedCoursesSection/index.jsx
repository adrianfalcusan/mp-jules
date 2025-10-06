import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import AnimatedSection from "../AnimatedSection";
import CourseCard from "../CourseCard";

const FeaturedCoursesSection = ({ courses, loading }) => {
  return (
    <AnimatedSection delay={0.4}>
      <Box sx={{ py: 8 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 2 }}
        >
          Cursuri recomandate
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4, opacity: 0.7 }}>
          Descoperă cele mai populare cursuri de la profesori verificați.
        </Typography>
        {loading ? (
          <Typography align="center">Loading courses...</Typography>
        ) : (
          <Box sx={{ py: 6 }}>
            <Grid container spacing={4} justifyContent="center">
              {courses.map((course) => (
                <Grid item key={course._id} xs={12} sm={6} md={4} lg={3}>
                  <CourseCard course={course} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </AnimatedSection>
  );
};

export default FeaturedCoursesSection;
