const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emotion: String,         // e.g., 'happy','sad','neutral','angry','surprised'
  score: Number,           // confidence (0-1)
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mood', moodSchema);
