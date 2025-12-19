const mongoose = require('mongoose');
const reviewSchema = require('./Review');
const hotelRoomSchema = require('./HotelRoom');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['Restaurant', 'Hotel', 'Cafe', 'Mountain', 'Visitable Place'],
    required: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  latitude: {
    type: Number,
    default: 0,
  },
  longitude: {
    type: Number,
    default: 0,
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  reviews: {
    type: [reviewSchema],
    default: [],
  },
  uploadedAt: {
    type: Number,
    default: Date.now,
  },
  rooms: {
    type: [hotelRoomSchema],
    default: [],
  },
}, {
  timestamps: true,
});

// Index for faster queries
placeSchema.index({ uploaderId: 1 });
placeSchema.index({ category: 1 });

module.exports = mongoose.model('Place', placeSchema);

