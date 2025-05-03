const express = require('express');
const router = express.Router();

const Sale = require('../models/Sale');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

// GET /api/sales
router.get('/', async (req, res) => {
  const sales = await Sale.find();
  res.json(sales);
});

// POST /api/sales
router.post('/', async (req, res) => {
  const session = await Sale.startSession();
  session.startTransaction();
  try {
    const { items } = req.body;

    // Check stock for all products
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || !product.isActive) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }
    }

    // Deduct stock for all products
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Create the sale
    const sale = new Sale(req.body);
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(sale);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/sales/:id/verify-transfer
router.put('/:id/verify-transfer', async (req, res) => {
  const sale = await Sale.findByIdAndUpdate(
    req.params.id,
    { transferVerified: true },
    { new: true }
  );
  res.json(sale);
});

// PUT /api/sales/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  const session = await Sale.startSession();
  session.startTransaction();
  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Sale not found' });
    }
    if (sale.cancelled) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Sale already cancelled' });
    }

    // Return stock to inventory for each item
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    // Mark the sale as cancelled (add a 'cancelled' field if not present)
    sale.cancelled = true;
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Sale cancelled and stock returned', sale });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

// Only employees can place sales
router.post('/', authMiddleware, allowRoles('empleado', 'admin'), async (req, res) => {
  const session = await Sale.startSession();
  session.startTransaction();
  try {
    const { items } = req.body;

    // Check stock for all products
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || !product.isActive) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }
    }

    // Deduct stock for all products
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // Create the sale
    const sale = new Sale(req.body);
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(sale);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

// Only admins can cancel sales
router.put('/:id/cancel', authMiddleware, allowRoles('admin'), async (req, res) => {
  const session = await Sale.startSession();
  session.startTransaction();
  try {
    const sale = await Sale.findById(req.params.id).session(session);
    if (!sale) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Sale not found' });
    }
    if (sale.cancelled) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Sale already cancelled' });
    }

    // Return stock to inventory for each item
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    // Mark the sale as cancelled (add a 'cancelled' field if not present)
    sale.cancelled = true;
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Sale cancelled and stock returned', sale });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

// Only admins can view all sales
router.get('/', authMiddleware, allowRoles('admin'), async (req, res) => {
  const sales = await Sale.find();
  res.json(sales);
});

module.exports = router;