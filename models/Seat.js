const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  code: { type: String, required: true },
  floor: Number,
  type: String,
  isAvailable: { type: Boolean, default: true },
  holdUntil: { type: Date, default: null },
  passenger: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    origin: String,
    destination: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Seat', seatSchema);

