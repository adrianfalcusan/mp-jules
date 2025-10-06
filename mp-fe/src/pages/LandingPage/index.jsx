// src/pages/LandingPage/index.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  Stack,
  Chip,
} from "@mui/material";
import {
  PlayCircle,
  Star,
  People,
  ArrowForward,
  Headphones,
  Psychology,
  EmojiEvents,
  Groups,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";

import Layout from "../../components/Layout";
import AuthModal from "../../components/AuthModal";
import LoginForm from "../../components/LoginForm";
import SignupForm from "../../components/SignupForm";
import bgVideo from "../../assets/video/abstractguy.mp4";
import spotlightVideoBg from "../../assets/video/spotlightVideoBg.mp4";


// Import centralized design system
import { designSystem } from "../../theme";

// Use centralized design system
const theme = designSystem;

const API_BASE = process.env.REACT_APP_API_BASE_URL;

// Helper to set meta tags
function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
function setOG(property, content) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
// Set page meta will be called inside the component

// Modern Hero Section
const ModernHeroSection = ({ onShowLoginModal, onShowSignupModal }) => {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${theme.background.main} 0%, ${theme.background.paper} 100%)`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 50%, ${theme.primary.main}15 0%, transparent 50%), radial-gradient(circle at 70% 50%, ${theme.secondary.main}15 0%, transparent 50%)`,
          zIndex: 1,
        },
      }}
    >
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.3,
        }}
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          zIndex: 1,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Stack spacing={6} alignItems="center" textAlign="center">
            {/* Main Title */}
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "3rem", md: "4.5rem", lg: "6rem" },
                  fontWeight: 800,
                  color: theme.text.primary,
                  mb: 3,
                  background: theme.primary.gradient,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 4px 20px rgba(15, 23, 42, 0.5)",
                }}
              >
                MUSICLOUD
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  color: theme.text.secondary,
                  fontWeight: 300,
                  mb: 4,
                  maxWidth: 800,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                Master music with world-class instructors. Start your musical
                journey today with interactive lessons and personalized
                feedback.
              </Typography>
            </Box>

            {/* Feature Pills */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mb: 4 }}
            >
              {[
                { icon: <Star />, text: "Expert Instructors" },
                { icon: <People />, text: "Live Sessions" },
                { icon: <PlayCircle />, text: "Interactive Lessons" },
              ].map((feature, index) => (
                <Chip
                  key={index}
                  icon={feature.icon}
                  label={feature.text}
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: theme.text.primary,
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    fontSize: "1rem",
                    py: 2,
                    px: 3,
                    "& .MuiChip-icon": {
                      color: theme.primary.main,
                    },
                  }}
                />
              ))}
            </Stack>

            {/* CTA Buttons */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <Button
                variant="contained"
                size="large"
                onClick={onShowSignupModal}
                sx={{
                  background: theme.primary.gradient,
                  color: "white",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: "none",
                  boxShadow: `0 8px 25px ${theme.primary.main}40`,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 35px ${theme.primary.main}60`,
                  },
                }}
                endIcon={<ArrowForward />}
              >
                Start Learning Now
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={onShowLoginModal}
                sx={{
                  color: theme.text.primary,
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  px: 4,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: "none",
                  backdropFilter: "blur(10px)",
                  background: "rgba(255, 255, 255, 0.05)",
                  "&:hover": {
                    borderColor: theme.primary.main,
                    background: `${theme.primary.main}20`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Sign In
              </Button>
            </Stack>

            {/* Scroll Indicator */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ marginTop: "4rem" }}
            >
              <KeyboardArrowDown
                sx={{
                  fontSize: 40,
                  color: theme.text.muted,
                  cursor: "pointer",
                }}
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              />
            </motion.div>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <PlayCircle />,
      title: "Interactive Lessons",
      description:
        "Hands-on video lessons with gamified exercises and instant feedback.",
      color: theme.primary.main,
    },
    {
      icon: <Star />,
      title: "Expert Instructors",
      description:
        "Learn from top musicians who track your progress and provide personalized guidance.",
      color: theme.secondary.main,
    },
    {
      icon: <Groups />,
      title: "Vibrant Community",
      description:
        "Join live jam sessions, monthly challenges, and collaborate with fellow musicians.",
      color: theme.success,
    },
    {
      icon: <Psychology />,
      title: "Personalized Learning",
      description:
        "AI-powered recommendations adapt to your skill level and learning style.",
      color: theme.info,
    },
    {
      icon: <EmojiEvents />,
      title: "Achievement System",
      description:
        "Earn badges, unlock new content, and track your musical journey.",
      color: theme.warning,
    },
    {
      icon: <Headphones />,
      title: "Multi-Track Studio",
      description:
        "Practice with isolated tracks and professional backing music.",
      color: theme.error,
    },
  ];

  return (
    <Box sx={{ py: 12, background: theme.background.main }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              color: theme.text.primary,
              mb: 3,
              background: theme.primary.gradient,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Why Choose MusiCloud?
          </Typography>

          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: theme.text.secondary,
              mb: 8,
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            A musical playground where technology meets creativity, designed to
            accelerate your learning journey.
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={feature.title}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      background: theme.background.paper,
                      border: `1px solid ${theme.background.light}30`,
                      borderRadius: 3,
                      p: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: `0 20px 40px ${feature.color}20`,
                        border: `1px solid ${feature.color}50`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 3,
                        background: `${feature.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      {React.cloneElement(feature.icon, {
                        sx: { fontSize: 30, color: feature.color },
                      })}
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.text.primary,
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.text.secondary,
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

// Featured Courses Section
const FeaturedCoursesSection = ({ courses, loading }) => {
  if (loading) {
    return (
      <Box sx={{ py: 12, background: theme.background.paper }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ textAlign: "center", mb: 6, color: theme.text.primary }}
          >
            Featured Courses
          </Typography>
          <Grid container spacing={4}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{ background: theme.background.light, borderRadius: 3 }}
                >
                  <Box
                    sx={{ height: 200, background: theme.background.lighter }}
                  />
                  <CardContent>
                    <Box
                      sx={{
                        height: 100,
                        background: theme.background.lighter,
                        borderRadius: 1,
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 12, background: theme.background.paper }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h2"
            sx={{
              textAlign: "center",
              fontWeight: 800,
              color: theme.text.primary,
              mb: 3,
              background: theme.primary.gradient,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Featured Courses
          </Typography>

          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: theme.text.secondary,
              mb: 8,
              maxWidth: 600,
              mx: "auto",
            }}
          >
            Start your musical journey with our most popular courses
          </Typography>

          <Grid container spacing={4}>
            {courses.slice(0, 4).map((course, index) => (
              <Grid item xs={12} sm={6} md={3} key={course._id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      background: theme.background.main,
                      border: `1px solid ${theme.background.light}30`,
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: `0 20px 40px ${theme.primary.main}20`,
                        border: `1px solid ${theme.primary.main}50`,
                      },
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={
                          course.thumbnailUrl ||
                          course.thumbnail ||
                          "/assets/course-fallback.jpg"
                        }
                        alt={course.title}
                        sx={{ objectFit: "cover" }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={
                            course.price === 0 ? "FREE" : `$${course.price}`
                          }
                          size="small"
                          sx={{
                            background:
                              course.price === 0
                                ? theme.success
                                : theme.primary.main,
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: theme.text.primary,
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {course.title}
                      </Typography>

                      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <People
                            sx={{ fontSize: 16, color: theme.text.muted }}
                          />
                          <Typography
                            variant="caption"
                            color={theme.text.muted}
                          >
                            {course.enrollments || 0}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          <Star sx={{ fontSize: 16, color: theme.warning }} />
                          <Typography
                            variant="caption"
                            color={theme.text.muted}
                          >
                            4.8
                          </Typography>
                        </Stack>
                      </Stack>

                      <Button
                        component={Link}
                        to={`/courses/${course._id}`}
                        variant="contained"
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          background: theme.primary.gradient,
                          "&:hover": {
                            background: theme.primary.dark,
                          },
                        }}
                      >
                        Start Course
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Button
              component={Link}
              to="/courses"
              variant="outlined"
              size="large"
              sx={{
                borderColor: theme.primary.main,
                color: theme.primary.main,
                px: 6,
                py: 2,
                borderRadius: 3,
                "&:hover": {
                  background: theme.primary.main,
                  color: "white",
                },
              }}
              endIcon={<ArrowForward />}
            >
              View All Courses
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

// CTA Section
const CTASection = ({ onShowSignup, onShowLogin }) => (
  <Box
    sx={{
      py: 12,
      background: `linear-gradient(135deg, ${theme.primary.main} 0%, ${theme.secondary.main} 100%)`,
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url(${spotlightVideoBg}) center/cover`,
        opacity: 0.1,
        zIndex: 0,
      },
    }}
  >
    <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "white",
              mb: 2,
            }}
          >
            Ready to Start Your Musical Journey?
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              maxWidth: 600,
              mx: "auto",
              mb: 4,
            }}
          >
            Join thousands of musicians who are already transforming their
            skills with MusiCloud. Start learning today!
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={onShowSignup}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: "1.1rem",
                background: "white",
                color: theme.primary.main,
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.9)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(255, 255, 255, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
              endIcon={<ArrowForward />}
            >
              Get Started Free
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={onShowLogin}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "white",
                borderColor: "white",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Stack>
      </motion.div>
    </Container>
  </Box>
);

// Main Landing Page Component
const LandingPage = () => {
  useEffect(() => {
    document.title =
      "MUSICLOUD — Learn music with world‑class tutorials and courses";
    setMeta(
      "description",
      "Discover premium music courses and tutorials. Practice smarter with progress tracking and achievements."
    );
    setOG("og:title", "MUSICLOUD");
    setOG("og:description", "Discover premium music courses and tutorials.");
  }, []);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Fetch featured courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/courses`);
        if (res.data.success) {
          setFeaturedCourses(res.data.courses.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <Box sx={{ background: theme.background.main, minHeight: "100vh" }}>
      <Layout paddingTop={0}>
        <ModernHeroSection
          onShowLoginModal={() => setShowLoginModal(true)}
          onShowSignupModal={() => setShowSignupModal(true)}
        />

        <FeaturesSection />

        <FeaturedCoursesSection
          courses={featuredCourses}
          loading={loadingCourses}
        />

        <CTASection
          onShowSignup={() => setShowSignupModal(true)}
          onShowLogin={() => setShowLoginModal(true)}
        />

        <AuthModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="Login"
        >
          <LoginForm onClose={() => setShowLoginModal(false)} />
        </AuthModal>

        <AuthModal
          open={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          title="Sign Up"
        >
          <SignupForm onClose={() => setShowSignupModal(false)} />
        </AuthModal>
      </Layout>
    </Box>
  );
};

export default LandingPage;
