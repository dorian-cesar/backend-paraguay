const mongoose = require('mongoose');

const seatMapSchema = new mongoose.Schema({
  seatMap: [[String]] // Matriz con identificadores de asientos
}, { _id: false });

const busLayoutSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  rows: Number,
  columns: Number,
  pisos: Number,
  capacidad: Number,
  tipo_Asiento_piso_1: String,
  tipo_Asiento_piso_2: String,
  floor1: seatMapSchema,
  floor2: seatMapSchema
}, { timestamps: true });

module.exports = mongoose.model('BusLayout', busLayoutSchema);
