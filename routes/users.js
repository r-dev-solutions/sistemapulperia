const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

const User = require('../models/User');

// GET /api/users
router.get('/', authMiddleware, allowRoles('admin'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// POST /api/users
router.post('/', authMiddleware, allowRoles('admin'), async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});

// PUT /api/users/:id
router.put('/:id', authMiddleware, allowRoles('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
});

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, allowRoles('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;