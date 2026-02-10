require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend/public'), {
  setHeaders: (res, path) => {
    if (path.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

connectDB(process.env.MONGO_URI);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/moods', require('./routes/moods'));
app.use('/api/songs', require('./routes/songs'));

const port = process.env.BACKEND_PORT || process.env.PORT || 5000;
app.listen(port, ()=> console.log('Server running on', port));
