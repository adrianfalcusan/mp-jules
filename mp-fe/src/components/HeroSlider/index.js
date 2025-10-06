import React from "react";
import Slider from "react-slick";
import { Box, Typography, Button } from "@mui/material";

// Sample slides data:
const slidesData = [
  {
    image: "/assets/banner1.jpg",
    title: "Keep moving up",
    description:
      "Learn the skills you need to take the next step — and every step after. Courses from RON49.99 through March 27.",
    buttonText: "Explore Courses",
    buttonLink: "/courses",
  },
  {
    image: "/assets/banner2.jpg",
    title: "Expand your expertise",
    description:
      "Dive into new skills or refine the ones you have with our top-rated instructors.",
    buttonText: "See All",
    buttonLink: "/courses",
  },
];

const HeroSlider = () => {
  // React Slick settings:
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // Show 1 slide at a time
    slidesToScroll: 1,
    arrows: true, // Show next/prev arrows
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Slider {...settings}>
        {slidesData.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              color: "#fff",
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: { xs: 300, md: 400 },
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Overlay (optional) for a tinted background */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              }}
            />
            {/* Text container (left side “card”) */}
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                marginLeft: { xs: 2, md: 6 },
                maxWidth: { xs: "80%", md: "40%" },
              }}
            >
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
                {slide.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {slide.description}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                href={slide.buttonLink}
              >
                {slide.buttonText}
              </Button>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default HeroSlider;
