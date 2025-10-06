import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  CardMedia,
  CardContent,
  Button,
  Box,
  Chip,
  Avatar,
  IconButton,
  InputAdornment,
  TextField,
  Container,
  Paper,
  Stack,
  Skeleton,
  ButtonGroup,
} from "@mui/material";
import {
  Search,
  FilterList,
  ViewList,
  Star,
  TrendingUp,
  AccessTime,
  Groups,
  Piano,
  MusicNote,
  Mic,
  Album,
  QueueMusic,
  GraphicEq,
  Bookmark,
  BookmarkBorder,
  SpatialAudio,
  Waves,
  LibraryMusic,
  VolumeUp,
  Equalizer,
  Clear,
  School,
  PlayCircle,
  People,
  LocalFireDepartment,
  NewReleases,
  Sort,
  GridView,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

import Layout from "../../components/Layout";
import api from "../../services/api";
import { designSystem } from "../../theme";

// Use centralized design system
const theme = designSystem;
// Enhanced Hero Section with Advanced Effects
const ModernHero = ({
  firstName,
  totalCourses,
  totalTutorials,
  totalStudents,
  averageRating,
  platformStats,
  onSearchChange,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const clearSearch = () => {
    setSearchValue("");
    onSearchChange("");
  };

  const musicIcons = [
    <Piano key="piano" />,
    <MusicNote key="music" />,
    <Mic key="mic" />,
    <Album key="album" />,
    <QueueMusic key="queue" />,
    <LibraryMusic key="library" />,
    <VolumeUp key="volume" />,
    <Equalizer key="equalizer" />,
    <SpatialAudio key="spatial" />,
    <Waves key="waves" />,
  ];

  return (
    <Box
      sx={{
        background: theme.background.main,
        borderBottom: `1px solid rgba(255,255,255,0.1)`,
        py: 6,
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Stack spacing={8} alignItems="center" textAlign="center">
            {/* Floating Music Icons */}
            <Box sx={{ position: "relative", width: "100%", height: 100 }}>
              {musicIcons.map((icon, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    scale: [0, 1.2, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.5,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    left: `${10 + index * 8}%`,
                    top: `${20 + Math.sin(index) * 30}px`,
                    color:
                      index % 2 === 0
                        ? theme.primary.main
                        : theme.secondary.main,
                    fontSize: "2rem",
                    filter: "drop-shadow(0 0 10px currentColor)",
                  }}
                >
                  {icon}
                </motion.div>
              ))}
            </Box>

            {/* Main Title with Advanced Typography */}
            <Box>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 800, color: theme.text.primary, mb: 1 }}
                >
                  Catalog
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: theme.text.secondary }}
                >
                  Browse courses and tutorials. Filter by type, popularity, and
                  rating.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: theme.text.secondary,
                    fontWeight: 300,
                    mb: 4,
                    maxWidth: 800,
                    mx: "auto",
                    lineHeight: 1.8,
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  {firstName
                    ? `Welcome back, ${firstName}! Continue your musical journey with our premium courses and tutorials.`
                    : "Unlock your musical potential with world-class instructors and cutting-edge learning technology."}
                </Typography>
              </motion.div>
            </Box>

            {/* Enhanced Search Bar with Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{ width: "100%", maxWidth: 700 }}
            >
              <Paper
                elevation={0}
                sx={{
                  background: `${theme.background.glass}`,
                  backdropFilter: "blur(20px)",
                  borderRadius: 999,
                  p: 1.5,
                  width: "100%",
                  border: `2px solid ${isSearchFocused ? theme.primary.main : "rgba(255, 255, 255, 0.1)"}`,
                  boxShadow: isSearchFocused
                    ? theme.primary.glow
                    : "0 8px 32px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                    transition: "left 0.6s ease",
                    ...(isSearchFocused && { left: "100%" }),
                  },
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Search courses, tutorials, or instructors..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      background: "transparent",
                      border: "none",
                      "& fieldset": { border: "none" },
                      "& input": {
                        color: theme.text.primary,
                        fontSize: "1.2rem",
                        py: 1.5,
                        fontWeight: 500,
                      },
                      "& input::placeholder": {
                        color: theme.text.muted,
                        opacity: 0.8,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search
                          sx={{
                            color: isSearchFocused
                              ? theme.primary.main
                              : theme.text.muted,
                            fontSize: "1.5rem",
                            transition: "color 0.3s ease",
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: searchValue && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={clearSearch}
                          sx={{
                            color: theme.text.muted,
                            "&:hover": {
                              color: theme.primary.main,
                              background: `${theme.primary.main}20`,
                            },
                          }}
                        >
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Paper>
            </motion.div>

            {/* Enhanced Statistics with Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ width: "100%" }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={4}
                justifyContent="center"
                alignItems="center"
              >
                {[
                  {
                    icon: <School />,
                    number: totalCourses || "50+",
                    label: "Premium Courses",
                    color: theme.primary.main,
                    gradient: theme.primary.gradient,
                  },
                  {
                    icon: <PlayCircle />,
                    number: totalTutorials || "200+",
                    label: "Video Tutorials",
                    color: theme.secondary.main,
                    gradient: theme.secondary.gradient,
                  },
                  {
                    icon: <People />,
                    number:
                      platformStats.totalUsers > 0
                        ? platformStats.totalUsers
                        : totalStudents || "10K+",
                    label:
                      platformStats.totalUsers > 0
                        ? "Platform Users"
                        : "Total Enrollments",
                    color: theme.success,
                    gradient:
                      "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  },
                  {
                    icon: <Star />,
                    number: averageRating || "4.9",
                    label: "Average Rating",
                    color: theme.warning,
                    gradient:
                      "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        background: `${theme.background.glass}`,
                        backdropFilter: "blur(20px)",
                        borderRadius: 4,
                        p: 4,
                        textAlign: "center",
                        minWidth: 180,
                        border: `1px solid rgba(255, 255, 255, 0.1)`,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "3px",
                          background: stat.gradient,
                        },
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: `0 12px 40px rgba(0, 0, 0, 0.4), ${stat.color}40 0px 0px 20px`,
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Box
                        sx={{
                          mb: 2,
                          color: stat.color,
                          display: "flex",
                          justifyContent: "center",
                          "& svg": {
                            fontSize: "2.5rem",
                            filter: `drop-shadow(0 0 10px ${stat.color}50)`,
                          },
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: theme.text.primary,
                          mb: 1,
                          background: stat.gradient,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.text.secondary,
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>

            {/* Scroll Indicator with Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{ marginTop: "3rem" }}
            >
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                <Box
                  sx={{
                    cursor: "pointer",
                    color: theme.text.muted,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    "&:hover": {
                      color: theme.primary.main,
                    },
                    transition: "color 0.3s ease",
                  }}
                  onClick={() => {
                    document.getElementById("courses-section")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Explore Courses
                  </Typography>
                  <Box
                    sx={{
                      width: 2,
                      height: 30,
                      background: `linear-gradient(to bottom, ${theme.primary.main}, transparent)`,
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </motion.div>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

ModernHero.propTypes = {
  firstName: PropTypes.string,
  totalCourses: PropTypes.number,
  totalTutorials: PropTypes.number,
  totalStudents: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  averageRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  platformStats: PropTypes.shape({
    totalUsers: PropTypes.number,
    activeUsers: PropTypes.number,
  }),
  onSearchChange: PropTypes.func.isRequired,
};

// Enhanced Filter System with Advanced Styling
const ModernFilterBar = ({
  filter,
  setFilter,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  totalResults,
}) => {
  const filterOptions = [
    {
      key: "all",
      label: "All Content",
      icon: <FilterList />,
      color: theme.text.muted,
      gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
    },
    {
      key: "courses",
      label: "Courses",
      icon: <School />,
      color: theme.primary.main,
      gradient: theme.primary.gradient,
    },
    {
      key: "tutorials",
      label: "Tutorials",
      icon: <Piano />,
      color: theme.secondary.main,
      gradient: theme.secondary.gradient,
    },
    {
      key: "free",
      label: "Free",
      icon: <LocalFireDepartment />,
      color: theme.success,
      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    },
    {
      key: "popular",
      label: "Popular",
      icon: <TrendingUp />,
      color: theme.warning,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    },
    {
      key: "new",
      label: "New",
      icon: <NewReleases />,
      color: theme.info,
      gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    },
  ];

  const sortOptions = [
    { key: "newest", label: "Newest First", icon: <NewReleases /> },
    { key: "popular", label: "Most Popular", icon: <TrendingUp /> },
    { key: "rating", label: "Highest Rated", icon: <Star /> },
    { key: "price-low", label: "Price: Low to High", icon: <Sort /> },
    { key: "price-high", label: "Price: High to Low", icon: <Sort /> },
  ];

  return (
    <Box id="courses-section" sx={{ mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          background: `${theme.background.glass}`,
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          p: 3,
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          position: "sticky",
          top: 80,
          zIndex: 10,
        }}
      >
        <Stack spacing={4}>
          {/* Header with Results Count */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: theme.text.primary,
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Explore Learning Content
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.text.secondary,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <GraphicEq sx={{ fontSize: 16 }} />
                {totalResults} results found
              </Typography>
            </Box>

            {/* View Mode Toggle */}
            <ButtonGroup
              variant="outlined"
              sx={{
                "& .MuiButtonGroup-grouped": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  color: theme.text.muted,
                  "&:hover": {
                    borderColor: theme.primary.main,
                    background: `${theme.primary.main}20`,
                    color: theme.primary.main,
                  },
                  "&.active": {
                    background: theme.primary.gradient,
                    color: "white",
                    borderColor: theme.primary.main,
                  },
                },
              }}
            >
              <Button
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "active" : ""}
                startIcon={<GridView />}
              >
                Grid
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "active" : ""}
                startIcon={<ViewList />}
              >
                List
              </Button>
            </ButtonGroup>
          </Box>

          {/* Enhanced Filter Chips */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.text.secondary,
                mb: 2,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FilterList sx={{ fontSize: 18 }} />
              Filter by Category
            </Typography>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": {
                  height: 6,
                },
                "&::-webkit-scrollbar-track": {
                  background: theme.background.light,
                  borderRadius: 3,
                },
                "&::-webkit-scrollbar-thumb": {
                  background: theme.primary.main,
                  borderRadius: 3,
                },
              }}
            >
              {filterOptions.map((option, index) => (
                <motion.div
                  key={option.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Chip
                    icon={option.icon}
                    label={option.label}
                    onClick={() => setFilter(option.key)}
                    variant={filter === option.key ? "filled" : "outlined"}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 600,
                      flexShrink: 0,
                      px: 2,
                      py: 1,
                      height: 44,
                      fontSize: "0.875rem",
                      transition: "all 0.3s ease",
                      ...(filter === option.key
                        ? {
                            background: option.gradient,
                            color: "white",
                            border: "none",
                            boxShadow: `0 4px 15px ${option.color}40`,
                            "& .MuiChip-icon": { color: "white" },
                            "&:hover": {
                              background: option.gradient,
                              filter: "brightness(1.1)",
                              transform: "translateY(-2px)",
                              boxShadow: `0 6px 20px ${option.color}50`,
                            },
                          }
                        : {
                            background: "rgba(255, 255, 255, 0.05)",
                            color: theme.text.secondary,
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            "& .MuiChip-icon": { color: theme.text.muted },
                            "&:hover": {
                              background: `${option.color}20`,
                              borderColor: option.color,
                              color: option.color,
                              "& .MuiChip-icon": { color: option.color },
                            },
                          }),
                    }}
                  />
                </motion.div>
              ))}
            </Stack>
          </Box>

          {/* Enhanced Sort Options */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.text.secondary,
                mb: 2,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Sort sx={{ fontSize: 18 }} />
              Sort by
            </Typography>

            <Stack direction="row" spacing={1.5}>
              {sortOptions.map((option, index) => (
                <motion.div
                  key={option.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setSortBy(option.key)}
                    variant={sortBy === option.key ? "contained" : "outlined"}
                    startIcon={option.icon}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      fontSize: "0.875rem",
                      ...(sortBy === option.key
                        ? {
                            background: theme.primary.gradient,
                            color: "white",
                            border: "none",
                            boxShadow: `0 4px 15px ${theme.primary.main}40`,
                            "&:hover": {
                              background: theme.primary.gradient,
                              filter: "brightness(1.1)",
                              transform: "translateY(-2px)",
                              boxShadow: `0 6px 20px ${theme.primary.main}50`,
                            },
                          }
                        : {
                            background: "rgba(255, 255, 255, 0.05)",
                            color: theme.text.secondary,
                            borderColor: "rgba(255, 255, 255, 0.2)",
                            "&:hover": {
                              background: `${theme.primary.main}20`,
                              borderColor: theme.primary.main,
                              color: theme.primary.main,
                            },
                          }),
                      transition: "all 0.3s ease",
                    }}
                  >
                    {option.label}
                  </Button>
                </motion.div>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

ModernFilterBar.propTypes = {
  filter: PropTypes.string.isRequired,
  setFilter: PropTypes.func.isRequired,
  viewMode: PropTypes.string.isRequired,
  setViewMode: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  totalResults: PropTypes.number.isRequired,
};

// Enhanced Course Card with Advanced Effects
const ModernCourseCard = ({ item, viewMode, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut",
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return `$${price}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return theme.success;
      case "intermediate":
        return theme.warning;
      case "advanced":
        return theme.error;
      default:
        return theme.text.muted;
    }
  };

  const getInstructorName = (item) => {
    return (
      item.instructor?.name ||
      item.createdBy ||
      item.teacher?.name ||
      "Adrian Fălcușan"
    );
  };

  const getInstructorAvatar = (item) => {
    return item.instructor?.avatar || item.teacher?.avatar;
  };

  const getInstructorInitial = (item) => {
    const name = getInstructorName(item);
    return name.charAt(0).toUpperCase();
  };

  const getRating = (item) => {
    const rating = item.rating || item.averageRating || 0;
    return typeof rating === "number" ? rating : parseFloat(rating) || 0;
  };

  const getStudentCount = (item) => {
    return (
      item.students ||
      item.enrollments ||
      item.enrollmentCount ||
      item.views ||
      item.purchaseCount ||
      0
    );
  };

  const getDuration = (item) => {
    if (item.formattedDuration) return item.formattedDuration;
    if (item.duration && item.duration > 0) {
      const hours = Math.floor(item.duration / 60);
      const minutes = item.duration % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    return "Duration TBD";
  };

  const getThumbnailUrl = (item) => {
    // Check multiple possible thumbnail fields
    // 1. Direct thumbnail URL (should be Bunny CDN URL)
    if (item.thumbnailUrl) {
      return item.thumbnailUrl;
    }

    // 2. Legacy thumbnail field
    if (item.thumbnail) {
      return item.thumbnail;
    }

    // 3. Legacy image field
    if (item.image) {
      return item.image;
    }

    // 4. Construct local URL from thumbnailKey (fallback)
    if (item.thumbnailKey) {
      return `http://localhost:8080/uploads/${item.thumbnailKey}`;
    }

    // 5. Default fallback
    return "/assets/course-fallback.jpg";
  };

  const getDescription = (item) => {
    return (
      item.description ||
      "Learn from industry experts with hands-on projects and real-world applications."
    );
  };

  const getReviewCount = (item) => {
    return item.reviews || item.reviewCount || 0;
  };

  if (viewMode === "list") {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Paper
          component={Link}
          to={
            item.type === "course"
              ? `/courses/${item._id}`
              : `/tutorial/${item._id}`
          }
          elevation={0}
          sx={{
            display: "flex",
            background: `${theme.background.glass}`,
            backdropFilter: "blur(20px)",
            borderRadius: 4,
            overflow: "hidden",
            textDecoration: "none",
            border: `1px solid ${isHovered ? theme.primary.main : "rgba(255, 255, 255, 0.1)"}`,
            boxShadow: isHovered
              ? `0 20px 40px rgba(0, 0, 0, 0.3), ${theme.primary.glow}`
              : "0 8px 32px rgba(0, 0, 0, 0.2)",
            transition: "all 0.4s ease",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background:
                item.type === "course"
                  ? theme.primary.gradient
                  : theme.secondary.gradient,
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
            },
          }}
        >
          {/* Enhanced Thumbnail */}
          <Box
            sx={{
              position: "relative",
              width: 200,
              height: 140,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <CardMedia
              component="img"
              image={getThumbnailUrl(item)}
              alt={item.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s ease",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
              }}
            />

            {/* Gradient Overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.3) 100%)`,
                opacity: isHovered ? 0.8 : 0.5,
                transition: "opacity 0.3s ease",
              }}
            />

            {/* Play Button Overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  variants={overlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: `${theme.primary.main}90`,
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `2px solid ${theme.primary.main}`,
                      boxShadow: `0 0 20px ${theme.primary.main}50`,
                    }}
                  >
                    <PlayCircle sx={{ fontSize: 30, color: "white" }} />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price Badge */}
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                background:
                  item.price && item.price > 0
                    ? theme.secondary.gradient
                    : theme.success,
                color: "white",
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontSize: "0.875rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              {formatPrice(item.price)}
            </Box>

            {/* Type Badge */}
            <Chip
              label={item.type === "course" ? "Course" : "Tutorial"}
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                background:
                  item.type === "course"
                    ? theme.primary.main
                    : theme.secondary.main,
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>

          {/* Enhanced Content */}
          <Box sx={{ flex: 1, p: 3, display: "flex", flexDirection: "column" }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.text.primary,
                  fontWeight: 700,
                  mb: 1,
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.text.secondary,
                  mb: 2,
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {getDescription(item)}
              </Typography>

              {/* Duration and Students Info */}
              <Box
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 16, color: theme.text.muted }} />
                  <Typography
                    variant="caption"
                    sx={{ color: theme.text.muted }}
                  >
                    {getDuration(item)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Groups sx={{ fontSize: 16, color: theme.text.muted }} />
                  <Typography
                    variant="caption"
                    sx={{ color: theme.text.muted }}
                  >
                    {getStudentCount(item)} students
                  </Typography>
                </Box>
              </Box>

              {/* Rating */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Star sx={{ fontSize: 16, color: "#f59e0b" }} />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: theme.text.primary }}
                  >
                    {getRating(item) > 0
                      ? Number(getRating(item)).toFixed(1)
                      : "New"}
                  </Typography>
                  {getReviewCount(item) > 0 && (
                    <Typography
                      variant="caption"
                      sx={{ color: theme.text.muted }}
                    >
                      ({getReviewCount(item)} reviews)
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Level Badge */}
              {item.level && (
                <Chip
                  label={
                    item.level.charAt(0).toUpperCase() + item.level.slice(1)
                  }
                  size="small"
                  sx={{
                    mb: 2,
                    backgroundColor: getDifficultyColor(item.level),
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </Box>

            {/* Enhanced Footer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  src={getInstructorAvatar(item)}
                  sx={{ width: 32, height: 32 }}
                >
                  {getInstructorInitial(item)}
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{ color: theme.text.secondary, fontWeight: 500 }}
                >
                  {getInstructorName(item)}
                </Typography>
              </Box>

              <IconButton
                onClick={handleBookmark}
                sx={{
                  color: isBookmarked ? theme.secondary.main : theme.text.muted,
                  "&:hover": {
                    background: `${theme.secondary.main}20`,
                    color: theme.secondary.main,
                  },
                }}
              >
                {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    );
  }

  // Grid View (Enhanced)
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Paper
        component={Link}
        to={
          item.type === "course"
            ? `/courses/${item._id}`
            : `/tutorial/${item._id}`
        }
        elevation={0}
        sx={{
          background: `${theme.background.glass}`,
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          overflow: "hidden",
          textDecoration: "none",
          border: `1px solid ${isHovered ? theme.primary.main : "rgba(255, 255, 255, 0.1)"}`,
          boxShadow: isHovered
            ? `0 20px 40px rgba(0, 0, 0, 0.3), ${theme.primary.glow}`
            : "0 8px 32px rgba(0, 0, 0, 0.2)",
          transition: "all 0.4s ease",
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              item.type === "course"
                ? theme.primary.gradient
                : theme.secondary.gradient,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          },
        }}
      >
        {/* Enhanced Thumbnail */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 200,
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={getThumbnailUrl(item)}
            alt={item.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
          />

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.3) 100%)`,
              opacity: isHovered ? 0.8 : 0.5,
              transition: "opacity 0.3s ease",
            }}
          />

          {/* Play Button Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: `${theme.primary.main}90`,
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid ${theme.primary.main}`,
                    boxShadow: `0 0 20px ${theme.primary.main}50`,
                  }}
                >
                  <PlayCircle sx={{ fontSize: 30, color: "white" }} />
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Price Badge */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              background:
                item.price && item.price > 0
                  ? theme.secondary.gradient
                  : theme.success,
              color: "white",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: "0.875rem",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            {formatPrice(item.price)}
          </Box>

          {/* Type Badge */}
          <Chip
            label={item.type === "course" ? "Course" : "Tutorial"}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              background:
                item.type === "course"
                  ? theme.primary.main
                  : theme.secondary.main,
              color: "white",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />

          {/* Bookmark Button */}
          <IconButton
            onClick={handleBookmark}
            sx={{
              position: "absolute",
              bottom: 12,
              right: 12,
              background: `${theme.background.glass}`,
              backdropFilter: "blur(10px)",
              color: isBookmarked ? theme.secondary.main : theme.text.muted,
              "&:hover": {
                background: `${theme.secondary.main}20`,
                color: theme.secondary.main,
              },
            }}
          >
            {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>

        {/* Enhanced Content */}
        <CardContent
          sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                color: theme.text.primary,
                fontWeight: 700,
                mb: 1,
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: theme.text.secondary,
                mb: 2,
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {getDescription(item)}
            </Typography>

            {/* Duration and Students Info */}
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: theme.text.muted }} />
                <Typography variant="caption" sx={{ color: theme.text.muted }}>
                  {getDuration(item)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Groups sx={{ fontSize: 16, color: theme.text.muted }} />
                <Typography variant="caption" sx={{ color: theme.text.muted }}>
                  {getStudentCount(item)} students
                </Typography>
              </Box>
            </Box>

            {/* Rating */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Star sx={{ fontSize: 16, color: "#f59e0b" }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: theme.text.primary }}
                >
                  {getRating(item) > 0
                    ? Number(getRating(item)).toFixed(1)
                    : "New"}
                </Typography>
                {getReviewCount(item) > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ color: theme.text.muted }}
                  >
                    ({getReviewCount(item)} reviews)
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Level Badge */}
            {item.level && (
              <Chip
                label={item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                size="small"
                sx={{
                  mb: 2,
                  backgroundColor: getDifficultyColor(item.level),
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            )}
          </Box>

          {/* Enhanced Footer */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={getInstructorAvatar(item)}
                sx={{ width: 32, height: 32 }}
              >
                {getInstructorInitial(item)}
              </Avatar>
              <Typography
                variant="caption"
                sx={{ color: theme.text.secondary, fontWeight: 500 }}
              >
                {getInstructorName(item)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Paper>
    </motion.div>
  );
};

ModernCourseCard.propTypes = {
  item: PropTypes.object.isRequired,
  viewMode: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

// Enhanced Loading Component
const ModernLoading = ({ viewMode }) => (
  <Container maxWidth="lg" sx={{ py: 8 }}>
    <Grid container spacing={4}>
      {Array.from({ length: viewMode === "grid" ? 8 : 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={viewMode === "grid" ? 3 : 12} key={index}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{
                background: `${theme.background.glass}`,
                backdropFilter: "blur(20px)",
                borderRadius: 4,
                overflow: "hidden",
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                ...(viewMode === "list" && { display: "flex", height: 200 }),
              }}
            >
              <Skeleton
                variant="rectangular"
                width={viewMode === "list" ? 250 : "100%"}
                height={viewMode === "list" ? 200 : 200}
                sx={{
                  background: `linear-gradient(90deg, ${theme.background.light} 0%, ${theme.background.lighter} 50%, ${theme.background.light} 100%)`,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s infinite",
                  "@keyframes shimmer": {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                  },
                }}
              />
              <Box sx={{ p: 3, flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="80%"
                  height={32}
                  sx={{ mb: 2, background: theme.background.light }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  sx={{ mb: 2, background: theme.background.light }}
                />
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Skeleton
                    variant="circular"
                    width={24}
                    height={24}
                    sx={{ background: theme.background.light }}
                  />
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={20}
                    sx={{ background: theme.background.light }}
                  />
                </Stack>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={40}
                  sx={{ background: theme.background.light }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  </Container>
);

ModernLoading.propTypes = {
  viewMode: PropTypes.string.isRequired,
};

// Enhanced Empty State Component
const EmptyState = ({ searchTerm, filter }) => (
  <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Box
        sx={{
          background: `${theme.background.glass}`,
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          p: 6,
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Search
            sx={{
              fontSize: 80,
              color: theme.text.muted,
              mb: 3,
              opacity: 0.7,
            }}
          />
        </motion.div>

        <Typography
          variant="h4"
          sx={{
            color: theme.text.primary,
            fontWeight: 700,
            mb: 2,
          }}
        >
          No Results Found
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.text.secondary,
            mb: 4,
            lineHeight: 1.6,
          }}
        >
          {searchTerm
            ? `We couldn't find any courses or tutorials matching "${searchTerm}"`
            : `No ${filter === "all" ? "content" : filter} available at the moment`}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{
              borderColor: theme.primary.main,
              color: theme.primary.main,
              "&:hover": {
                background: `${theme.primary.main}20`,
                borderColor: theme.primary.main,
              },
            }}
          >
            Try Again
          </Button>

          <Button
            variant="contained"
            component={Link}
            to="/"
            sx={{
              background: theme.primary.gradient,
              "&:hover": {
                background: theme.primary.gradient,
                filter: "brightness(1.1)",
              },
            }}
          >
            Go Home
          </Button>
        </Stack>
      </Box>
    </motion.div>
  </Container>
);

EmptyState.propTypes = {
  searchTerm: PropTypes.string,
  filter: PropTypes.string,
};

// Main Component
export default function CatalogPage() {
  const user = useSelector((s) => s.auth.user);
  const [courses, setCourses] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    averageRating: 0,
  });
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    document.title = "Browse Courses & Tutorials — MUSICLOUD";
    setMeta(
      "description",
      "Explore curated music learning content. Filter by type, popularity, and rating."
    );
    setOG("og:title", "MUSICLOUD Catalog");
    setOG("og:description", "Explore curated music learning content.");
  }, []);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const [coursesRes, tutorialsRes] = await Promise.all([
          api.get("/courses"),
          api.get("/tutorials"),
        ]);

        let coursesData = [];
        let tutorialsData = [];

        if (coursesRes.data.success) {
          coursesData = coursesRes.data.courses.map((course) => ({
            ...course,
            type: "course",
            itemType: "course", // Keep for backward compatibility
            // Map backend fields to frontend expected fields
            thumbnailUrl: course.thumbnailUrl || course.thumbnail,
            instructor: course.teacher
              ? {
                  name: course.teacher.name,
                  email: course.teacher.email,
                  avatar: course.teacher.avatar,
                }
              : null,
            createdBy: course.teacher?.name,
            // Use ONLY real data from backend
            studentsCount: course.enrollments || course.students || 0,
            rating: course.rating || course.averageRating || 0,
            reviews:
              course.reviews || course.reviewCount || course.totalRatings || 0,
            duration: course.formattedDuration || "Duration TBD",
            difficulty: course.level || "beginner",
          }));
          setCourses(coursesData);
        }

        if (tutorialsRes.data.success) {
          tutorialsData = tutorialsRes.data.tutorials.map((tutorial) => ({
            ...tutorial,
            type: "tutorial",
            itemType: "tutorial", // Keep for backward compatibility
            // Map backend fields to frontend expected fields
            thumbnailUrl: tutorial.thumbnailUrl || tutorial.thumbnail,
            instructor: tutorial.teacher
              ? {
                  name: tutorial.teacher.name,
                  email: tutorial.teacher.email,
                  avatar: tutorial.teacher.avatar,
                }
              : null,
            createdBy: tutorial.teacher?.name,
            // Use ONLY real data from backend
            studentsCount: tutorial.students || tutorial.purchaseCount || 0,
            rating: tutorial.rating || tutorial.averageRating || 0,
            reviews:
              tutorial.reviews ||
              tutorial.reviewCount ||
              tutorial.totalRatings ||
              0,
            duration: tutorial.formattedDuration || "Duration TBD",
            difficulty: tutorial.level || "beginner",
          }));
          setTutorials(tutorialsData);
        }

        // Calculate content statistics from real data
        const allItems = [...coursesData, ...tutorialsData];
        const totalEnrollments = allItems.reduce(
          (sum, item) => sum + (item.studentsCount || 0),
          0
        );
        const ratedItems = allItems.filter(
          (item) => Number(item.reviews) > 0 && Number(item.rating) > 0
        );
        const averageRating =
          ratedItems.length > 0
            ? (
                ratedItems.reduce(
                  (sum, item) => sum + parseFloat(item.rating || 0),
                  0
                ) / ratedItems.length
              ).toFixed(1)
            : "4.8";

        setStatistics({
          totalStudents: totalEnrollments, // This is enrollment count, not user count
          averageRating,
        });

        // Fetch real platform statistics if user is admin
        if (user?.role === "admin") {
          try {
            const statsRes = await api.get("/admin/analytics");
            if (statsRes.data.success) {
              setPlatformStats({
                totalUsers: statsRes.data.analytics.users.total,
                activeUsers: statsRes.data.analytics.users.active,
              });
            }
          } catch (error) {
            console.log("Admin analytics not available:", error.message);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [user?.role]);

  // Combine courses and tutorials with proper type mapping
  const items = [...courses, ...tutorials];

  const filtered = items.filter((item) => {
    // Apply filter
    let matchesFilter = true;
    switch (filter) {
      case "courses":
        matchesFilter = item.type === "course";
        break;
      case "tutorials":
        matchesFilter = item.type === "tutorial";
        break;
      case "free":
        matchesFilter = !item.price || item.price === 0;
        break;
      case "popular":
        matchesFilter = (item.studentsCount || 0) > 100;
        break;
      case "new": {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        matchesFilter =
          new Date(item.createdAt || item.updatedAt) > thirtyDaysAgo;
        break;
      }
      default:
        matchesFilter = true;
    }

    // Apply search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      item.title?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.instructor?.name?.toLowerCase().includes(searchLower) ||
      item.createdBy?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.studentsCount || 0) - (a.studentsCount || 0);
      case "rating":
        return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "newest":
      default:
        return (
          new Date(b.createdAt || b.updatedAt || 0) -
          new Date(a.createdAt || a.updatedAt || 0)
        );
    }
  });

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <Box sx={{ background: theme.background.main, minHeight: "100vh" }}>
      <Layout paddingTop="0">
        <ModernHero
          firstName={firstName}
          totalCourses={courses.length}
          totalTutorials={tutorials.length}
          totalStudents={statistics.totalStudents}
          averageRating={statistics.averageRating}
          platformStats={platformStats}
          onSearchChange={setSearchTerm}
        />

        <Container maxWidth="xl" sx={{ py: 6 }}>
          <ModernFilterBar
            filter={filter}
            setFilter={setFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalResults={sorted.length}
          />

          {loading ? (
            <ModernLoading viewMode={viewMode} />
          ) : sorted.length === 0 ? (
            <EmptyState searchTerm={searchTerm} filter={filter} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filter}-${searchTerm}-${viewMode}-${sortBy}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={3}>
                  {sorted.map((item, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={viewMode === "grid" ? 4 : 12}
                      key={item._id}
                    >
                      <ModernCourseCard
                        item={item}
                        viewMode={viewMode}
                        index={index}
                      />
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </AnimatePresence>
          )}
        </Container>
      </Layout>
    </Box>
  );
}

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
