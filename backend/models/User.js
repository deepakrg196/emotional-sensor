const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: 'user' }, // admin/user
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
