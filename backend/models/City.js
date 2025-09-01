const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'City name is required'],
    trim: true,
    unique: true
  },
  nameAlbanian: {
    type: String,
    required: [true, 'City name in Albanian is required'],
    trim: true
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true
  },
  population: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
citySchema.index({ name: 1 });
citySchema.index({ nameAlbanian: 1 });
citySchema.index({ region: 1 });
citySchema.index({ isActive: 1 });

module.exports = mongoose.model('City', citySchema);
