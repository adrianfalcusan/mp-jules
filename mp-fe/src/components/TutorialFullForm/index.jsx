import React, { useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import { motion } from "framer-motion";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function TutorialFullForm() {
  /* ───── local state */
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [thumb, setThumb] = useState(null);
  const [video, setVideo] = useState(null);
  const [msg, setMsg] = useState({ ok: "", err: "", uploading: false });

  const token = localStorage.getItem("token");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ───── helper: upload thumbnail to Bunny via backend */
  const uploadThumb = async () => {
    if (!thumb) return "";
    const fd = new FormData();
    fd.append("thumbnail", thumb);
    const { data } = await axios.post(
      `${API_BASE}/tutorials/upload-thumbnail`,
      fd,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!data.success || !data.url)
      throw new Error(data.message || "Thumbnail upload failed");
    return data.url;
  };

  /* ───── submit (multipart create-with-video) */
  const submit = async (e) => {
    e.preventDefault();
    setMsg({ ok: "", err: "", uploading: false });

    if (!video)
      return setMsg({
        ok: "",
        err: "Please choose a video file",
        uploading: false,
      });

    try {
      setMsg({ ok: "", err: "", uploading: true });

      /* 1 thumbnail (optional) */
      const thumbnailUrl = await uploadThumb();

      /* 2 create tutorial + upload video in one step */
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("price", form.price || "0");
      if (thumbnailUrl) fd.append("thumbnailUrl", thumbnailUrl);
      fd.append("video", video);

      const { data: createRes } = await axios.post(
        `${API_BASE}/tutorials/create-with-video`,
        fd,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!createRes.success) throw new Error(createRes.message);

      setMsg({
        ok: `Tutorial "${createRes.tutorial.title}" created and uploaded! Pending approval.`,
        err: "",
        uploading: false,
      });

      /* clear form */
      setForm({ title: "", description: "", price: "" });
      setThumb(null);
      setVideo(null);
    } catch (err) {
      setMsg({
        ok: "",
        err: err.response?.data?.message || err.message,
        uploading: false,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Create Tutorial (all‑in‑one)
        </Typography>

        {msg.err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {msg.err}
          </Alert>
        )}
        {msg.ok && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {msg.ok}
          </Alert>
        )}
        {msg.uploading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Uploading… please wait
          </Alert>
        )}

        <Box component="form" onSubmit={submit}>
          <TextField
            label="Title"
            name="title"
            fullWidth
            required
            value={form.title}
            onChange={handle}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            required
            multiline
            rows={3}
            value={form.description}
            onChange={handle}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Price (€)"
            name="price"
            type="number"
            required
            fullWidth
            value={form.price}
            onChange={handle}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Choose Thumbnail
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setThumb(e.target.files?.[0] || null)}
            />
          </Button>
          {thumb && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Thumbnail: {thumb.name}
            </Typography>
          )}

          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Choose Main Video
            <input
              type="file"
              hidden
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
            />
          </Button>
          {video && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Video: {video.name}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={msg.uploading}
          >
            Create Tutorial
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
}
