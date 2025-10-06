const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Video proxy route
app.get('/proxy-video/:courseId', async (req, res) => {
  try {
    const course = await mongoose.connection.db.collection('courses').findOne({
      _id: new mongoose.Types.ObjectId(req.params.courseId)
    });
    
    if (!course || !course.bunnyVideoUrl) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    console.log('Proxying video:', course.bunnyVideoUrl);
    
    // For now, return the URL directly
    res.json({
      success: true,
      videoUrl: course.bunnyVideoUrl,
      message: 'Video URL provided'
    });
    
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Proxy failed' });
  }
});

app.listen(PORT, () => {
  console.log(\Video proxy server running on port \\);
  console.log(\Test: http://localhost:\/proxy-video/68ced1904dc45b310c64ac4a\);
});
