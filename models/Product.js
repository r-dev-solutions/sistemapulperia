const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  stock: { type: Number, required: true },
  minStock: { type: Number, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  expiryDate: { type: Date },
  isActive: { type: Boolean, default: true },
  presentation: { type: String } // Added field for product presentation
});

module.exports = mongoose.model('Product', productSchema);