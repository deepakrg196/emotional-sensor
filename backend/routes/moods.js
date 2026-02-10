const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'secret';

// simple auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.id;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
}

router.post('/', auth, async (req, res) => {
  try {
    const { emotion, score } = req.body;
    const m = new Mood({
      user: req.userId,
      emotion,
      score
    });
    await m.save();
    res.json({ message: 'saved', mood: m });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// history
router.get('/history', auth, async (req, res) => {
  const moods = await Mood.find({ user: req.userId }).sort({ timestamp: -1 }).limit(200);
  res.json(moods);
});

// admin: get aggregated (simple)
router.get('/admin/summary', async (req, res) => {
  // implement RBAC in production
  const agg = await Mood.aggregate([
    { $group: { _id: "$emotion", count: { $sum: 1 } } }
  ]);
  res.json(agg);
});

module.exports = router;
