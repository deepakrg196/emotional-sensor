const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET || 'secret';

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const u = new User({ name, email, passwordHash: hash });
    await u.save();
    const token = jwt.sign({ id: u._id }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { name: u.name, email: u.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: u._id }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, user: { name: u.name, email: u.email } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
