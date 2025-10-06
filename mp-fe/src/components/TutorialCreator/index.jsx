import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Chip,
} from "@mui/material";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const steps = ["Details", "Thumbnail", "Video", "Multitracks", "Finish"];

export default function TutorialCreator() {
  const token = localStorage.getItem("token");
  const [activeStep, setActiveStep] = useState(0);

  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [thumb, setThumb] = useState(null);
  const [thumbUrl, setThumbUrl] = useState("");
  const [video, setVideo] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [tutorialId, setTutorialId] = useState(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [progress, setProgress] = useState(0);

  const headers = { Authorization: `Bearer ${token}` };

  const next = () => setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setActiveStep((s) => Math.max(s - 1, 0));

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const uploadThumbnail = async () => {
    if (!thumb) return "";
    const fd = new FormData();
    fd.append("thumbnail", thumb);
    const { data } = await axios.post(
      `${API_BASE}/tutorials/upload-thumbnail`,
      fd,
      { headers }
    );
    if (!data.success || !data.url)
      throw new Error(data.message || "Thumbnail upload failed");
    setThumbUrl(data.url);
    return data.url;
  };

  const createWithVideo = async () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("price", form.price || "0");
    if (thumbUrl) fd.append("thumbnailUrl", thumbUrl);
    fd.append("video", video);
    const { data } = await axios.post(
      `${API_BASE}/tutorials/create-with-video`,
      fd,
      {
        headers,
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
      }
    );
    if (!data.success) throw new Error(data.message || "Create failed");
    setTutorialId(data.tutorial.id || data.tutorial._id);
    setMsg("Tutorial created and video uploaded. You can add multitracks now.");
    setProgress(0);
  };

  const uploadMultitracks = async () => {
    if (!tutorialId || tracks.length === 0) return;
    const fd = new FormData();
    tracks.forEach((f) => fd.append("multitracks", f));
    const { data } = await axios.post(
      `${API_BASE}/tutorials/${tutorialId}/multitracks`,
      fd,
      {
        headers,
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded * 100) / (e.total || 1))),
      }
    );
    if (!data.success)
      throw new Error(data.message || "Multitrack upload failed");
    setMsg(`Uploaded ${data.tracks.length} track(s).`);
    setProgress(0);
    // clear the local queue after successful upload
    setTracks([]);
  };

  const handleNext = async () => {
    try {
      setErr("");
      if (activeStep === 0) {
        if (!form.title || !form.description)
          throw new Error("Please fill in title and description");
        next();
      } else if (activeStep === 1) {
        await uploadThumbnail();
        next();
      } else if (activeStep === 2) {
        if (!video) throw new Error("Please choose a video file");
        await createWithVideo();
        next();
      } else if (activeStep === 3) {
        // Upload only if there are files queued; otherwise just move on
        if (tracks.length > 0) {
          await uploadMultitracks();
        }
        next();
      }
    } catch (e) {
      setErr(e.message || "Action failed");
    }
  };

  const removeTrack = (idx) =>
    setTracks((prev) => prev.filter((_, i) => i !== idx));

  const StepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              required
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label">
              Choose Thumbnail
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setThumb(e.target.files?.[0] || null)}
              />
            </Button>
            {thumb && (
              <Typography sx={{ mt: 1 }}>Selected: {thumb.name}</Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label">
              Choose Main Video
              <input
                type="file"
                hidden
                accept="video/*"
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
              />
            </Button>
            {video && (
              <Typography sx={{ mt: 1 }}>Selected: {video.name}</Typography>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label">
              Add Multitracks (audio)
              <input
                type="file"
                hidden
                multiple
                accept="audio/*"
                onChange={(e) =>
                  setTracks((prev) => [
                    ...prev,
                    ...Array.from(e.target.files || []),
                  ])
                }
              />
            </Button>
            {tracks.length > 0 && (
              <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {tracks.map((t, i) => (
                  <Chip
                    key={i}
                    label={t.name}
                    onDelete={() => removeTrack(i)}
                  />
                ))}
              </Box>
            )}
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 1, opacity: 0.8 }}
            >
              You can add multiple files at once or add more files repeatedly
              before clicking Next.
            </Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success">
              All done. Tutorial is pending approval.
            </Alert>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Create Tutorial
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {err && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {err}
        </Alert>
      )}
      {msg && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {msg}
        </Alert>
      )}
      {progress > 0 && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      <StepContent />

      <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
        <Button disabled={activeStep === 0} onClick={back}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          {activeStep < steps.length - 1 ? "Next" : "Finish"}
        </Button>
      </Box>
    </Box>
  );
}
