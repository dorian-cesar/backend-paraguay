// models/Seat.js (modificado)
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
    origin: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    boardingStop: String,
    landingStop: String,
    boarded: { type: Boolean, default: false }, // Si el pasajero subió
    landed: { type: Boolean, default: false } // Si el pasajero bajó
  }
}, { timestamps: true });

seatSchema.methods.releaseSeat = function () {
  this.isAvailable = true;
  this.holdUntil = null;
  this.passenger = undefined;
  return this.save();
};

seatSchema.methods.markAsBoarded = function () {
  this.passenger.boarded = true;
  return this.save();
};

seatSchema.methods.markAsLanded = function () {
  this.passenger.landed = true;
  this.isAvailable = true;
  this.passenger = {
    user: this.passenger.user,
    origin: this.passenger.origin,
    destination: this.passenger.destination,
    boardingStop: this.passenger.boardingStop,
    landingStop: this.passenger.landingStop,
    boarded: true,
    landed: true
  };
  return this.save();
};

module.exports = mongoose.model('Seat', seatSchema);