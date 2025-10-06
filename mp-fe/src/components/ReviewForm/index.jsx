import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Rating,
  Avatar,
  Stack,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useSelector } from "react-redux";

import { apiService } from "../../services/api";
import theme from "../../theme";

// Styled Components
const StyledCard = styled(Card)(() => ({
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "20px",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.08)",
    transform: "translateY(-2px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
  },
}));

const GlowingRating = styled(Rating)(() => ({
  "& .MuiRating-iconFilled": {
    color: "#FFD700",
    filter: "drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
  },
  "& .MuiRating-iconHover": {
    color: "#FFE55C",
    filter: "drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))",
  },
  "& .MuiRating-iconEmpty": {
    color: "rgba(255, 255, 255, 0.3)",
  },
}));

const SubmitButton = styled(Button)(() => ({
  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
  color: "white",
  fontWeight: 600,
  padding: "12px 32px",
  borderRadius: "12px",
  textTransform: "none",
  boxShadow: "0 8px 20px rgba(99, 102, 241, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 25px rgba(99, 102, 241, 0.6)",
  },
  "&:disabled": {
    background: "rgba(255, 255, 255, 0.1)",
    color: "rgba(255, 255, 255, 0.5)",
    transform: "none",
    boxShadow: "none",
  },
}));

export default function ReviewForm({ itemId, itemType, onReviewSubmitted }) {
  const { user, token } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(-1);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Load reviews and user's review
  const loadReviews = useCallback(async () => {
    try {
      const [reviewsRes, myReviewRes] = await Promise.all([
        apiService.reviews.getByItem(itemType, itemId),
        token
          ? apiService.reviews.getMyReview(itemType, itemId)
          : { success: true, review: null },
      ]);

      if (reviewsRes.success) {
        setReviews(reviewsRes.reviews || []);
      }

      if (myReviewRes.success && myReviewRes.review) {
        setMyReview(myReviewRes.review);
        setRating(myReviewRes.review.rating);
        setComment(myReviewRes.review.comment || "");
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [itemType, itemId, token]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const reviewData = {
        itemId,
        itemType,
        rating,
        comment: comment.trim(),
      };

      const result = await apiService.reviews.create(reviewData);

      if (result.success) {
        setSuccess(
          myReview
            ? "Review updated successfully!"
            : "Review submitted successfully!"
        );
        setMyReview(result.review);

        // Reload reviews to show updated list
        await loadReviews();

        // Notify parent component
        if (onReviewSubmitted) {
          onReviewSubmitted(result.review);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const result = await apiService.reviews.delete(reviewToDelete._id);

      if (result.success) {
        setSuccess("Review deleted successfully!");
        setMyReview(null);
        setRating(0);
        setComment("");
        await loadReviews();

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      setError(err.response?.data?.message || "Failed to delete review");
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  // Rating labels
  const getRatingLabel = (value) => {
    const labels = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };
    return labels[value] || "";
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">Loading reviews...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header */}
      <Typography
        variant="h5"
        sx={{ mb: 3, color: theme.palette.text.primary, fontWeight: 600 }}
      >
        Reviews & Ratings
      </Typography>

      {/* User's Review Form (if logged in and enrolled) */}
      {user && token && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StyledCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: theme.palette.text.primary }}
              >
                {myReview ? "Update Your Review" : "Write a Review"}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {/* Rating */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, color: theme.palette.text.secondary }}
                  >
                    Rating *
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <GlowingRating
                      value={rating}
                      onChange={(event, newValue) => setRating(newValue)}
                      onChangeActive={(event, newHover) =>
                        setHoverRating(newHover)
                      }
                      size="large"
                      icon={<StarIcon fontSize="inherit" />}
                      emptyIcon={<StarBorderIcon fontSize="inherit" />}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary, minWidth: 80 }}
                    >
                      {getRatingLabel(
                        hoverRating !== -1 ? hoverRating : rating
                      )}
                    </Typography>
                  </Stack>
                </Box>

                {/* Comment */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Share your experience (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others about your experience with this content..."
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(255, 255, 255, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: theme.palette.text.secondary,
                    },
                    "& .MuiInputBase-input": {
                      color: theme.palette.text.primary,
                    },
                  }}
                />

                {/* Actions */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    {myReview && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          setReviewToDelete(myReview);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{
                          borderColor: "rgba(244, 67, 54, 0.5)",
                          color: "#f44336",
                          "&:hover": {
                            borderColor: "#f44336",
                            background: "rgba(244, 67, 54, 0.1)",
                          },
                        }}
                      >
                        Delete Review
                      </Button>
                    )}
                  </Box>

                  <SubmitButton
                    type="submit"
                    disabled={!rating || submitting}
                    startIcon={myReview ? <EditIcon /> : <StarIcon />}
                  >
                    {submitting
                      ? "Submitting..."
                      : myReview
                        ? "Update Review"
                        : "Submit Review"}
                  </SubmitButton>
                </Stack>
              </Box>
            </CardContent>
          </StyledCard>
        </motion.div>
      )}

      {/* Reviews List */}
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 3, color: theme.palette.text.primary }}
        >
          All Reviews ({reviews.length})
        </Typography>

        {reviews.length === 0 ? (
          <StyledCard>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <StarBorderIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.text.secondary,
                  mb: 2,
                }}
              />
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.secondary, mb: 1 }}
              >
                No reviews yet
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Be the first to share your experience!
              </Typography>
            </CardContent>
          </StyledCard>
        ) : (
          <Stack spacing={3}>
            <AnimatePresence>
              {reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <StyledCard>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={2}>
                        {/* Avatar */}
                        <Avatar
                          sx={{
                            background:
                              "linear-gradient(45deg, #6366f1, #8b5cf6)",
                            width: 48,
                            height: 48,
                          }}
                        >
                          {review.student?.name?.[0]?.toUpperCase() || (
                            <PersonIcon />
                          )}
                        </Avatar>

                        {/* Content */}
                        <Box sx={{ flex: 1 }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  color: theme.palette.text.primary,
                                  fontWeight: 600,
                                }}
                              >
                                {review.student?.name || "Anonymous"}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1 }}
                              >
                                <GlowingRating
                                  value={review.rating}
                                  readOnly
                                  size="small"
                                />
                                <Chip
                                  label={`${review.rating}/5`}
                                  size="small"
                                  sx={{
                                    background: "rgba(255, 215, 0, 0.2)",
                                    color: "#FFD700",
                                    fontWeight: 600,
                                  }}
                                />
                              </Stack>
                            </Box>

                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.text.secondary }}
                            >
                              {format(
                                new Date(review.createdAt),
                                "MMM dd, yyyy"
                              )}
                            </Typography>
                          </Stack>

                          {review.comment && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                                mt: 1,
                                lineHeight: 1.6,
                                fontStyle:
                                  review.comment.length > 100
                                    ? "normal"
                                    : "italic",
                              }}
                            >
                              "{review.comment}"
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "rgba(30, 30, 30, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          Delete Review
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary }}>
            Are you sure you want to delete your review? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteReview}
            color="error"
            variant="contained"
            sx={{
              background: "linear-gradient(45deg, #f44336, #d32f2f)",
              "&:hover": {
                background: "linear-gradient(45deg, #d32f2f, #b71c1c)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
