const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    patente: { type: String, required: true, unique: true, trim: true },
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    anio: { type: Number, required: true },
    revision_tecnica: { type: Date, required: true },
    permiso_circulacion: { type: Date, required: true },
    disponible: { type: Boolean, default: true },
    layout: { type: mongoose.Schema.Types.ObjectId, ref: 'BusLayout', required: true }
}, { timestamps: true });

module.exports = mongoose.model("Bus", busSchema);
