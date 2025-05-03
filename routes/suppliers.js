const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

const Supplier = require('../models/Supplier');

// GET /api/suppliers
router.get('/', authMiddleware, allowRoles('admin'), async (req, res) => {
  const suppliers = await Supplier.find();
  res.json(suppliers);
});

// POST /api/suppliers
router.post('/', authMiddleware, allowRoles('admin'), async (req, res) => {
  const supplier = new Supplier(req.body);
  await supplier.save();
  res.status(201).json(supplier);
});

// PUT /api/suppliers/:id
router.put('/:id', authMiddleware, allowRoles('admin'), async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(supplier);
});

// DELETE /api/suppliers/:id
router.delete('/:id', authMiddleware, allowRoles('admin'), async (req, res) => {
  await Supplier.findByIdAndDelete(req.params.id);
  res.json({ message: 'Supplier deleted' });
});

module.exports = router;