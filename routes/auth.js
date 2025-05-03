const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, isActive: true });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '8h'
  });
  res.json({ token });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  // Placeholder: Should use auth middleware to get user from token
  res.status(501).json({ message: 'Not implemented' });
});

// POST /api/auth/register-admin (only if no users exist)
router.post('/register-admin', async (req, res) => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return res.status(403).json({ message: 'Admin registration is closed' });
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new User({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });
  await admin.save();
  res.status(201).json({ message: 'Admin user created', admin: { name, email, role: admin.role } });
});

module.exports = router;