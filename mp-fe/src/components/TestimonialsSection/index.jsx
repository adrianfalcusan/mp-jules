// src/components/TestimonialsSection/index.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TestimonialsSection = ({ testimonials = [], loading }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768, // mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading) return null;
  if (!testimonials.length) return null;

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "#111",
        color: "#fff",
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 6 },
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: 6,
          fontSize: { xs: "2rem", md: "2.5rem" },
        }}
      >
        Ce spun studenții noștri
      </Typography>

      <Slider {...settings}>
        {testimonials.map((testimonial, index) => (
          <Box
            key={index}
            sx={{
              px: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: 600,
              mx: "auto",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontStyle: "italic",
                mb: 3,
                fontSize: "1.1rem",
              }}
            >
              “{testimonial.quote}”
            </Typography>

            {/* Avatar (optional - only show if we have one in future) */}
            {/* <Avatar
              alt={testimonial.name}
              src={testimonial.avatarUrl}
              sx={{ width: 56, height: 56, mb: 1 }}
            /> */}

            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              — {testimonial.signature}
            </Typography>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default TestimonialsSection;
