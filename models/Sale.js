const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      subtotal: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['efectivo', 'transferencia'], required: true },
  cashReceived: { type: Number },
  change: { type: Number },
  transferRef: { type: String },
  transferBank: { type: String },
  transferVerified: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String },
  cancelled: { type: Boolean, default: false } // Add this field
});

module.exports = mongoose.model('Sale', saleSchema);