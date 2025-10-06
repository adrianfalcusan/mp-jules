import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Paper,
  Stack,
  Avatar,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
  VideoLibrary as VideoIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  TrendingUp as DifficultyIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AdminApproval = () => {
  const navigate = useNavigate();
  const [pendingContent, setPendingContent] = useState({
    courses: [],
    tutorials: [],
  });
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [rejectDialog, setRejectDialog] = useState({
    open: false,
    item: null,
    type: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/approval/pending-approval", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setPendingContent(data.data);
      } else {
        console.error("Failed to fetch pending content:", data.message);
      }
    } catch (error) {
      console.error("Error fetching pending content:", error);
      setMessage("Failed to load pending content. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      setProcessingId(id);
      const response = await fetch(
        `/api/admin/approval/approve-${type}/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage(
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } approved successfully!`
        );
        fetchPendingContent(); // Refresh the list
      } else {
        setMessage(`Failed to approve ${type}: ${data.message}`);
      }
    } catch (error) {
      console.error("Error approving content:", error);
      setMessage(`Error approving ${type}. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    try {
      const { item, type } = rejectDialog;
      setProcessingId(item.id);

      const response = await fetch(
        `/api/admin/approval/reject/${type}/${item.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage(
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } rejected successfully!`
        );
        setRejectDialog({ open: false, item: null, type: "" });
        setRejectReason("");
        fetchPendingContent(); // Refresh the list
      } else {
        setMessage(`Failed to reject ${type}: ${data.message}`);
      }
    } catch (error) {
      console.error("Error rejecting content:", error);
      setMessage(`Error rejecting content. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const ContentCard = ({ item, type }) => (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Content Info */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {/* Title and Description */}
              <Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "primary.main" }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.6 }}
                >
                  {item.description}
                </Typography>
              </Box>

              {/* Metadata */}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  icon={<CategoryIcon />}
                  label={item.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<DifficultyIcon />}
                  label={item.difficulty}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
                <Chip
                  label={`$${item.price || 0}`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              {/* Author and Date */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.teacher?.name || "Unknown Teacher"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CalendarIcon sx={{ fontSize: 14 }} />
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          {/* Actions */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2} alignItems="flex-end">
              {/* Video Preview */}
              {item.videoUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VideoIcon />}
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Preview Video
                </Button>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} width="100%">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => handleApprove(item.id, type)}
                  disabled={processingId === item.id}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  {processingId === item.id ? "Processing..." : "Approve"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => setRejectDialog({ open: true, item, type })}
                  disabled={processingId === item.id}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Reject
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <LinearProgress sx={{ mb: 2, width: 300 }} />
          <Typography>Loading pending content...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin-dashboard")}
            sx={{ color: "white", mb: 2 }}
          >
            Back to Admin Dashboard
          </Button>

          <Typography
            variant="h3"
            sx={{ color: "white", fontWeight: 700, mb: 1 }}
          >
            Content Approval
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Review and approve pending courses and tutorials
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {message && (
          <Alert
            severity={message.includes("successfully") ? "success" : "error"}
            sx={{ mb: 3 }}
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        <Paper elevation={8} sx={{ borderRadius: 3, overflow: "hidden" }}>
          {/* Tabs */}
          <Box sx={{ bgcolor: "primary.main" }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                "& .MuiTab-root": {
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  "&.Mui-selected": {
                    color: "white",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "white",
                },
              }}
            >
              <Tab
                icon={<PendingIcon />}
                label={`Courses (${pendingContent.courses.length})`}
                iconPosition="start"
              />
              <Tab
                icon={<PendingIcon />}
                label={`Tutorials (${pendingContent.tutorials.length})`}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {tabValue === 0 && (
              <Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ mb: 3, fontWeight: 600 }}
                >
                  Pending Courses
                </Typography>
                {pendingContent.courses.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: "center", bgcolor: "grey.50" }}>
                    <PendingIcon
                      sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No pending courses
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All courses have been reviewed
                    </Typography>
                  </Paper>
                ) : (
                  pendingContent.courses.map((course) => (
                    <ContentCard key={course.id} item={course} type="course" />
                  ))
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ mb: 3, fontWeight: 600 }}
                >
                  Pending Tutorials
                </Typography>
                {pendingContent.tutorials.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: "center", bgcolor: "grey.50" }}>
                    <PendingIcon
                      sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No pending tutorials
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All tutorials have been reviewed
                    </Typography>
                  </Paper>
                ) : (
                  pendingContent.tutorials.map((tutorial) => (
                    <ContentCard
                      key={tutorial.id}
                      item={tutorial}
                      type="tutorial"
                    />
                  ))
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Reject Dialog */}
        <Dialog
          open={rejectDialog.open}
          onClose={() => setRejectDialog({ open: false, item: null, type: "" })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>Reject Content</DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Typography gutterBottom sx={{ mb: 3 }}>
              Are you sure you want to reject "
              <strong>{rejectDialog.item?.title}</strong>"?
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason (Required)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a clear reason for rejection to help the teacher improve their content..."
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={() =>
                setRejectDialog({ open: false, item: null, type: "" })
              }
              disabled={processingId}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              color="error"
              variant="contained"
              disabled={!rejectReason.trim() || processingId}
              startIcon={<RejectIcon />}
            >
              {processingId ? "Rejecting..." : "Reject Content"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminApproval;
