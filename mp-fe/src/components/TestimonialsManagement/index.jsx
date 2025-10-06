// src/components/TestimonialsManagement/index.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from "axios";

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTestimonial, setNewTestimonial] = useState({
    quote: "",
    signature: "",
  });
  const [feedback, setFeedback] = useState({ success: "", error: "" });

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/testimonials`
      );
      if (res.data.success) {
        setTestimonials(res.data.testimonials);
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/testimonials`,
        newTestimonial,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Testimonial create response:", res.data);
      if (res.data.success) {
        setFeedback({ success: "Testimonial created!", error: "" });
        setNewTestimonial({ quote: "", signature: "" });
        fetchTestimonials();
      } else {
        setFeedback({
          success: "",
          error: res.data.message || "Creation failed",
        });
      }
    } catch (err) {
      console.error("Error creating testimonial:", err);
      setFeedback({
        success: "",
        error: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Manage Testimonials
      </Typography>
      {/* New Testimonial Form */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Quote"
          fullWidth
          value={newTestimonial.quote}
          onChange={(e) =>
            setNewTestimonial({ ...newTestimonial, quote: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <TextField
          label="Signature"
          fullWidth
          value={newTestimonial.signature}
          onChange={(e) =>
            setNewTestimonial({ ...newTestimonial, signature: e.target.value })
          }
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="secondary" onClick={handleCreate}>
          Create Testimonial
        </Button>
        {feedback.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {feedback.error}
          </Alert>
        )}
        {feedback.success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {feedback.success}
          </Alert>
        )}
      </Box>

      {/* List of Testimonials */}
      <Typography variant="h6" gutterBottom>
        Existing Testimonials
      </Typography>
      {loading ? (
        <Typography>Loading testimonials...</Typography>
      ) : (
        <List>
          {testimonials.map((t) => (
            <ListItem key={t._id}>
              <ListItemText primary={t.quote} secondary={`- ${t.signature}`} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TestimonialsManagement;
