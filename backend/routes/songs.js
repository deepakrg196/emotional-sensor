const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const EMOTIONS = ['happy', 'sad', 'neutral', 'angry', 'surprised'];

router.get('/:emotion', (req, res) => {
  const { emotion } = req.params;

  if (!EMOTIONS.includes(emotion)) {
    return res.status(400).json({ error: 'Invalid emotion' });
  }

  const songsDir = path.join(__dirname, '../..', 'frontend', 'public', 'songs', emotion);

  fs.readdir(songsDir, (err, files) => {
    if (err) {
      console.error(`Error reading songs directory for ${emotion}:`, err.message);
      return res.json([]);
    }

    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp3', '.wav', '.ogg', '.m4a', '.aac'].includes(ext);
    });

    res.json(audioFiles);
  });
});

module.exports = router;
