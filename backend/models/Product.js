const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, required: true },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

  // Demo inventory settings
  isDemoProduct: {
    type: Boolean,
    default: false
  },
  initialStock: {
    type: Number,
    min: 0,
    default: null
  },
  restockAt: {
    type: Date,
    default: null
  },
  isDemoHidden: {
    type: Boolean,
    default: false
  },
  restoreAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);