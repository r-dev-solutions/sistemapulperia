const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

const InventoryLog = require('../models/InventoryLog');

// GET /api/inventory
router.get('/', authMiddleware, allowRoles('admin'), async (req, res) => {
  const logs = await InventoryLog.find();
  res.json(logs);
});

// POST /api/inventory/entry
router.post('/entry', authMiddleware, allowRoles('admin'), async (req, res) => {
  const log = new InventoryLog({ ...req.body, type: 'entrada' });
  await log.save();
  res.status(201).json(log);
});

// POST /api/inventory/adjustment
router.post('/adjustment', authMiddleware, allowRoles('admin'), async (req, res) => {
  const log = new InventoryLog({ ...req.body, type: 'ajuste' });
  await log.save();
  res.status(201).json(log);
});

module.exports = router;