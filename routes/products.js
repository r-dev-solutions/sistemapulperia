const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

const Product = require('../models/Product');

// GET /api/products
router.get('/', authMiddleware, allowRoles('admin'), async (req, res) => {
  // ... implement filtering logic
  const products = await Product.find();
  res.json(products);
});

// POST /api/products
router.post('/', authMiddleware, allowRoles('admin'), async (req, res) => {
  // ... implement creation logic
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, allowRoles('admin'), async (req, res) => {
  // ... implement update logic
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

// DELETE /api/products/:id (logical delete)
router.delete('/:id', authMiddleware, allowRoles('admin'), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  res.json(product);
});

module.exports = router;