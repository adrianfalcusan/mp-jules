import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Grid } from "@mui/material";
import CourseCard from "../CourseCard";

const FeaturedCourses = ({ courses }) => {
  const renderedCourses = useMemo(() => {
    return courses.map((course, index) => (
      <Grid item key={course._id} xs={12} sm={6} md={4} lg={3}>
        <CourseCard course={course} index={index} />
      </Grid>
    ));
  }, [courses]);

  return (
    <Box sx={{ py: 6 }}>
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: 700, color: "#2A2A2A", mb: 2 }}
      >
        Featured Courses
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {renderedCourses}
      </Grid>
    </Box>
  );
};

FeaturedCourses.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      thumbnailUrl: PropTypes.string,
      image: PropTypes.string,
      isNew: PropTypes.bool,
    })
  ).isRequired,
};

export default React.memo(FeaturedCourses);
