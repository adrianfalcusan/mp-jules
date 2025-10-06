// src/components/CourseLessonTracker/index.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  PlayCircleOutline,
  CheckCircle,
  Lock,
  Timer,
  School,
} from "@mui/icons-material";
import { useProgressTracking } from "../../hooks/useProgressTracking";

const CourseLessonTracker = ({
  course,
  currentLessonId,
  onLessonSelect,
  onLessonComplete,
  showOverallProgress = true,
}) => {
  const [expandedSections, setExpandedSections] = useState({});

  // Progress tracking for the overall course
  const {
    progress: courseProgress,
    isTracking,
    completeSection,
    loadProgress,
  } = useProgressTracking("course", course._id);

  // Load progress on mount
  useEffect(() => {
    if (course._id) {
      loadProgress();
    }
  }, [course._id, loadProgress]);

  // Calculate overall course progress
  const calculateOverallProgress = () => {
    if (!course.sections || course.sections.length === 0) return 0;

    const totalLessons = course.sections.reduce(
      (total, section) => total + (section.lessons?.length || 0),
      0
    );

    const completedLessons = courseProgress.completedSections?.length || 0;

    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId) => {
    return courseProgress.completedSections?.some(
      (section) => section.sectionId === lessonId
    );
  };

  // Check if lesson is accessible (previous lessons completed)
  const isLessonAccessible = (sectionIndex, lessonIndex) => {
    // First lesson is always accessible
    if (sectionIndex === 0 && lessonIndex === 0) return true;

    // Check if previous lesson is completed
    if (lessonIndex > 0) {
      const prevLesson = course.sections[sectionIndex].lessons[lessonIndex - 1];
      return isLessonCompleted(prevLesson._id);
    }

    // Check if previous section's last lesson is completed
    if (sectionIndex > 0) {
      const prevSection = course.sections[sectionIndex - 1];
      if (prevSection.lessons && prevSection.lessons.length > 0) {
        const lastLesson = prevSection.lessons[prevSection.lessons.length - 1];
        return isLessonCompleted(lastLesson._id);
      }
    }

    return false;
  };

  // Handle lesson selection
  const handleLessonSelect = (lesson, sectionIndex, lessonIndex) => {
    if (!isLessonAccessible(sectionIndex, lessonIndex)) {
      return; // Don't allow selection of locked lessons
    }

    onLessonSelect && onLessonSelect(lesson);
  };

  // Handle lesson completion
  const handleLessonComplete = async (lesson) => {
    try {
      await completeSection(lesson._id);
      onLessonComplete && onLessonComplete(lesson);
    } catch (error) {
      console.error("Failed to complete lesson:", error);
    }
  };

  // Handle section expansion
  const handleSectionExpand = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Get lesson status
  const getLessonStatus = (lesson, sectionIndex, lessonIndex) => {
    if (isLessonCompleted(lesson._id)) {
      return { status: "completed", icon: CheckCircle, color: "success" };
    }

    if (!isLessonAccessible(sectionIndex, lessonIndex)) {
      return { status: "locked", icon: Lock, color: "disabled" };
    }

    if (currentLessonId === lesson._id) {
      return { status: "current", icon: PlayCircleOutline, color: "primary" };
    }

    return { status: "available", icon: PlayCircleOutline, color: "action" };
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return "0min";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const overallProgress = calculateOverallProgress();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Course Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {course.title}
          </Typography>

          {showOverallProgress && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Overall Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(overallProgress)}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                  },
                }}
              />

              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Chip
                  icon={<School />}
                  label={`${courseProgress.completedSections?.length || 0} / ${
                    course.sections?.reduce(
                      (total, section) =>
                        total + (section.lessons?.length || 0),
                      0
                    ) || 0
                  } lessons`}
                  size="small"
                  variant="outlined"
                />

                <Chip
                  icon={<Timer />}
                  label={`${Math.round(courseProgress.timeSpent || 0)}min spent`}
                  size="small"
                  variant="outlined"
                />

                {isTracking && (
                  <Chip label="Tracking Active" color="primary" size="small" />
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Course Sections */}
        {course.sections &&
          course.sections.map((section, sectionIndex) => (
            <Accordion
              key={section._id || sectionIndex}
              expanded={expandedSections[section._id] || false}
              onChange={() => handleSectionExpand(section._id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                    {section.title}
                  </Typography>

                  {section.lessons && (
                    <Chip
                      label={`${
                        section.lessons.filter((lesson) =>
                          isLessonCompleted(lesson._id)
                        ).length
                      } / ${section.lessons.length}`}
                      size="small"
                      color={
                        section.lessons.every((lesson) =>
                          isLessonCompleted(lesson._id)
                        )
                          ? "success"
                          : "default"
                      }
                    />
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                {section.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {section.description}
                  </Typography>
                )}

                <List dense>
                  {section.lessons &&
                    section.lessons.map((lesson, lessonIndex) => {
                      const lessonStatus = getLessonStatus(
                        lesson,
                        sectionIndex,
                        lessonIndex
                      );
                      const StatusIcon = lessonStatus.icon;

                      return (
                        <React.Fragment key={lesson._id}>
                          <ListItem disablePadding>
                            <ListItemButton
                              onClick={() =>
                                handleLessonSelect(
                                  lesson,
                                  sectionIndex,
                                  lessonIndex
                                )
                              }
                              disabled={lessonStatus.status === "locked"}
                              selected={currentLessonId === lesson._id}
                            >
                              <ListItemIcon>
                                <StatusIcon color={lessonStatus.color} />
                              </ListItemIcon>

                              <ListItemText
                                primary={lesson.title}
                                secondary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                      alignItems: "center",
                                    }}
                                  >
                                    {lesson.duration && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {formatDuration(lesson.duration)}
                                      </Typography>
                                    )}

                                    {lesson.type && (
                                      <Chip
                                        label={lesson.type}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 16, fontSize: "0.6rem" }}
                                      />
                                    )}
                                  </Box>
                                }
                              />

                              {lessonStatus.status === "current" &&
                                !isLessonCompleted(lesson._id) && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLessonComplete(lesson);
                                    }}
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                            </ListItemButton>
                          </ListItem>

                          {lessonIndex < section.lessons.length - 1 && (
                            <Divider />
                          )}
                        </React.Fragment>
                      );
                    })}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
      </CardContent>
    </Card>
  );
};

export default CourseLessonTracker;
